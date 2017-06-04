import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {environment} from '../environments/environment';

/**
 * Classes are ordered by confidence and expressed in an array of tuples of
 * className and percentage confidence.
 */
type ClassesTuple = [string, number];

/**
 * App component for uploading photos to classify against a pre-trained image
 * classifying network. Uses Google's InceptionV3 network.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {

  private _loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _classes$: BehaviorSubject<ClassesTuple[]> = new BehaviorSubject<ClassesTuple[]>([]);
  private _uploadProgress$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _imageDataUrl$: ReplaySubject<string> = new ReplaySubject<string>(1);
  private _bestGuess$: BehaviorSubject<ClassesTuple> = new BehaviorSubject<ClassesTuple>(null);

  /**
   * Top rated class found in image (if any)
   */
  bestGuess$: Observable<ClassesTuple> = this._bestGuess$;

  /**
   * True/false loading state
   */
  loading$: Observable<boolean> = this._loading$;

  /**
   * The percentage of the file that has been uploaded
   */
  uploadProress$: Observable<number> = this._uploadProgress$;

  /**
   * Ordered tuples of class/percentage pairs for the currently classified image
   */
  classes$: Observable<ClassesTuple[]> = this._classes$;

  /**
   * The dataUrl of image data for displaying the classified image to the user
   */
  imageDataUrl$: Observable<string> = this._imageDataUrl$;

  /**
   * Assign a sentiment icon to value ranges for condfidence in classification
   * @param percentage The percentage value between 0 and 100
   * @returns {any} An md-icon name representing the sentiment felt about that value
   */
  getSentimentFromPercentage(percentage: number): string {
    if (percentage < 10) {
      return 'sentiment_very_dissatisfied'
    }
    if (percentage < 25) {
      return 'sentiment_dissatisfied'
    }
    if (percentage < 60) {
      return 'sentiment_neutral'
    }
    if (percentage > 60) {
      return 'sentiment_satisfied'
    }
    if (percentage > 90) {
      return 'sentiment_very_satisfied'
    }
  }

  onChooseFile(event) {
    console.log(event);
    const file = event.target.files[0];
    // Convert the blob to a dataUrl that can be assigned to an <img> element.
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', () => {
      this._imageDataUrl$.next(reader.result);
    }, false);

    // Upload the image to the classify endpoint
    return this.uploadBlob(file);
  }

  uploadBlob(dataBlob) {
    this._bestGuess$.next(null);
    this._uploadProgress$.next(0);
    this._loading$.next(true);
    const fd = new FormData();
    // The /classify endpoint looks for the formdata named 'photo'
    fd.append('photo', dataBlob);

    // Upload the file
    const xhr = new XMLHttpRequest();
    const remoteUrl = `${environment.apiHost}/api/classify`;
    xhr.open('POST', remoteUrl, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('pragma', 'no-cache');
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        this._uploadProgress$.next(Math.ceil((e.loaded / e.total) * 100));
      }
    }, false);
    xhr.addEventListener('load', (e) => {
      this._loading$.next(false);
      const target: any = e.target;
      const response = JSON.parse(target.responseText);
      this._classes$.next(response);
      this._bestGuess$.next(response[0]);
    }, false);
    xhr.send(fd);
  }
}
