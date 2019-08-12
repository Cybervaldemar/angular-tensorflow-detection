import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Prediction } from '../prediction';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as cocossd from '@tensorflow-models/coco-ssd';
import {Detection} from '../detection';

@Component({
  selector: 'app-image-classfier-upload',
  templateUrl: './image-classfier-upload.component.html',
  styleUrls: ['./image-classfier-upload.component.scss']
})
export class ImageClassfierUploadComponent implements OnInit {
  imageSrc: string;
  @ViewChild('img') imageEl: ElementRef;

  predictions: Prediction[];
  detections: Detection[];

  model: any;
  loading = true;
  image = new Image();

  constructor() { }

  async ngOnInit() {
    console.log('loading mobilenet model...');
    this.model = await cocossd.load();
    // this.model = await mobilenet.load();
    console.log('Sucessfully loaded model');
    this.loading = false;
  }

  async fileChangeEvent(event) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]);

      reader.onload = (res: any) => {
        this.imageSrc = res.target.result;
        setTimeout(async () => {
          const imgEl = this.imageEl.nativeElement;
          const c = document.getElementById('canvas') as HTMLCanvasElement;
          const context = c.getContext('2d');
          // console.log(await this.model.detect(imgEl));
          // this.detections = await this.model.detect(imgEl);gt
          this.image.onload = () => {
            console.log(this.image.width + ' ' + this.image.height);
            c.width = this.image.width;
            c.height = this.image.height;

            context.drawImage(this.image, 0, 0);
            context.font = '10px Arial';

            console.log('number of detections: ', this.detections.length);

            for (const detection of this.detections) {
              context.beginPath();
              context.rect(detection.bbox[0], detection.bbox[1], detection.bbox[2], detection.bbox[3]);
              context.lineWidth = 1;
              context.strokeStyle = 'green';
              context.fillStyle = 'green';
              context.stroke();
              context.fillText(
                  detection.score.toFixed(3) + ' ' + detection.class, detection.bbox[0],
                  detection.bbox[1] > 10 ? detection.bbox[1] - 5 : 10);
            }
          };
          this.image.src = this.imageSrc;
          this.detections = await this.model.detect(this.image);

          // this.predictions = await this.model.detect(imgEl);
        }, 0);

      };
    }

  }

}
