import os
import numpy as np
import tensorflow as tf
import json
import tempfile
from flask import Flask, request, redirect, url_for, flash, send_from_directory, jsonify
from hvass.hvass.inception import maybe_download, Inception
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = './data/tmp/'
ALLOWED_EXTENSIONS = set(['jpg', 'jpeg'])
app = Flask(__name__)

# Flask App for REST endpoints
app = Flask(__name__, static_url_path='')

# -----------------------------------------------------------------------------
# Shared inception model state, see: http://flask.pocoo.org/docs/0.12/appcontext/
# -----------------------------------------------------------------------------
model = None


def get_inception():
    global model
    if model is None:
        maybe_download()
        model = Inception()
        tf.summary.FileWriter('./data/logs/', model.graph)
    return model


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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

    result = {}

    # Iterate the top-k classes in reversed order (i.e. highest first).
    for cls in reversed(top_k):
        # Lookup the class-name.
        name = model.name_lookup.cls_to_name(cls=cls)

        # Predicted score (or probability) for this class.
        score = pred[cls]

        result[name] = np.asscalar(score);
    print('classes ' + json.dumps(obj=result, indent=2))
    return result


@app.route('/classify', methods=['POST'])
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
        filename = secure_filename(file.filename)
        # The temporary file name for the image
        tempFilePath = os.path.join(UPLOAD_FOLDER, tempfile.NamedTemporaryFile().name + '.jpeg')
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
