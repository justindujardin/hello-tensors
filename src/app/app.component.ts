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
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'app';

  private _loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _classes$: BehaviorSubject<ClassesTuple[]> = new BehaviorSubject<ClassesTuple[]>([]);
  private _uploadProgress$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _imageDataUrl$: ReplaySubject<string> = new ReplaySubject<string>(1);

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
    }, false);
    xhr.send(fd);
  }
}

//
// function setProgress(percentageComplete) {
//   console.log("uploading - " + percentageComplete);
// }
// function addImage(data) {
//   var img = new Image();
//   img.src = data;
//   $('.tensor-cards .mdl-card__media').empty().append($(img));
// }
// function renderClasses(classes) {
//   var progress = function (id) {
//     return '<div id="' + id + '" class="mdl-progress mdl-js-progress"></div>'
//   };
//   var script = function (id, percent) {
//     return '<script>' +
//       'var percent = ' + percent + ';' +
//       'var elem = document.getElementById("' + id + '");' +
//       'document.getElementById("' + id + '").addEventListener("mdl-componentupgraded", function () {' +
//       '  this.MaterialProgress.setProgress(' + percent + ');' +
//       '});' +
//       'setTimeout(function() { componentHandler.upgradeElement(document.getElementById("' + id + '")); }, 10);' +
//       '<\/script>';
//   };
//   var items = '';
//   var scripts = '';
//   Object.keys(classes).forEach(function (className) {
//     var value = classes[className];
//     var percent = value * 100;
//     className = className.replace(/[, ]+/g, "").trim();
//     var label = '<div>' + className + Math.round(percent) + '%</div>';
//     var subTitle = '<div>' + progress(className) + '</div>';
//     var itemHtml = '<li>' + label + subTitle + '</li>';
//     items = items + itemHtml;
//     scripts = scripts + script(className, percent);
//   });
//
//   var list = $('<ul class="demo-list-item mdl-list">' + items + '</ul>');
//   var classesElem = $('.tensor-classes');
//   classesElem.empty().append(list);
//   classesElem.append($(scripts));
// }
//
// function uploadBlob(dataBlob) {
//   var $loading = $('.uploading-progress');
//   $loading.addClass('is-active');
//   var fd = new FormData();
//   fd.append('photo', dataBlob);
//   var xhr = new XMLHttpRequest();
//   xhr.open('POST', '/classify', true);
//   xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
//   xhr.setRequestHeader("pragma", "no-cache");
//   xhr.upload.addEventListener("progress", function (e) {
//     if (e.lengthComputable) {
//       setProgress(Math.ceil((e.loaded / e.total) * 100))
//     }
//   }, false);
//   xhr.addEventListener("load", function (e) {
//     $loading.removeClass('is-active');
//     $('.tensor-cards').show();
//     var response = JSON.parse(e.target.responseText);
//     renderClasses(response);
// //            $('pre.classes').text(response);
//   }, false);
//   xhr.send(fd);
// }
// $().ready(function () {
//   $('input[name=photo]').change(function (e) {
//     var file = e.target.files[0];
//     var reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.addEventListener("load", function () {
//       addImage(reader.result);
//     }, false);
//     return uploadBlob(file);
//     canvasResize(file, {
//       width: 800,
//       height: 600,
//       crop: false,
//       quality: 100,
//       rotate: 0,
//       callback: function (data, width, height) {
//         addImage(data);
//         var dataBlob = canvasResize('dataURLtoBlob', data);
//         dataBlob.name = file.name;
//         uploadBlob(dataBlob);
//       }
//     });
//   });
// });
