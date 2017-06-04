import numpy as np
import os
import tempfile
import tensorflow as tf
from flask import Flask, request, jsonify
from hvass.inception import maybe_download, Inception
from flask_cors import CORS, cross_origin
UPLOAD_FOLDER = './data/tmp/'

# Flask App for REST endpoints
app = Flask(__name__, static_url_path='')
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# -----------------------------------------------------------------------------
# Shared inception model state
# -----------------------------------------------------------------------------
model = None

def get_inception():
    global model
    if model is None:
        maybe_download()
        model = Inception()
        tf.summary.FileWriter('./data/logs/', model.graph)
    return model

# -----------------------------------------------------------------------------
# Given the filepath to a JPEG image, classify it and return an array of the
# top (k) classes.
# -----------------------------------------------------------------------------
def classify_image(filename, k=10):
    model = get_inception()
    # Path for a jpeg-image that is included in the downloaded data.
    image_path = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.isfile(image_path):
        print('file does not exist: ' + image_path)
        return {}

    # Use the Inception model to classify the image.
    pred = model.classify(image_path=image_path)

    # Get a sorted index for the pred-array.
    idx = pred.argsort()

    # The index is sorted lowest-to-highest values. Take the last k.
    top_k = idx[-k:]

    result = []

    # Iterate the top-k classes in reversed order (i.e. highest first).
    for cls in reversed(top_k):
        # Lookup the class-name.
        name = model.name_lookup.cls_to_name(cls=cls)

        # Predicted score (or probability) for this class.
        score = pred[cls]

        # output as tuple [class, score]
        result.append([name, np.asscalar(score)]);
    return result


@app.route('/api/classify', methods=['POST'])
@cross_origin()
def classify():
    """
    Classify an uploaded image
    """
    # check if the post request has the file part
    if 'photo' not in request.files:
        return jsonify({'error': 'no file part'})
    file = request.files['photo']
    if file and file.content_type != 'image/jpeg':
        return jsonify({'error': 'only deals with jpeg'})
    elif file:
        # The temporary file name for the image
        tempFilePath = tempfile.NamedTemporaryFile().name + '.jpeg'
        # Write to disk
        file.save(tempFilePath)
        # Classify image on disk
        classes = classify_image(tempFilePath)
        os.remove(tempFilePath)
        return jsonify(classes)
    return jsonify({'error': 'unhandled branch'})


if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
    if model is not None:
        model.close()
