import { AfterContentInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { VideoService } from '../../services';
import { FsVideoConfig } from '../../interfaces';
import { Observable } from 'rxjs/Observable';
// import { DOM } from 'rxjs/observable/dom';
import {fromEvent} from 'rxjs/observable/fromEvent';

@Component({
  selector: 'fs-video',
  templateUrl: 'fs-video.component.html',
  styleUrls: [ 'fs-video.component.scss' ]
})
export class FsVideoComponent implements OnInit, AfterContentInit, OnDestroy {

  @Input() public config: FsVideoConfig;

  @ViewChild('video') public videoTag: ElementRef;

  public buffers = [];

  constructor(private _el: ElementRef, private _video: VideoService) {
  }

  get width() {
    return this._video.config.width || 'auto';
  }

  get height() {
    return this._video.config.height || 'auto';
  }

  get controls() {
    return this._video.config.controls;
  }

  public ngOnInit() {
    this._video.initConfig(this.config);
  }

  public ngAfterContentInit() {
    this._video.initPlayer(this._el, this.videoTag);
  }

  public ngOnDestroy() {
    this.destroy();
  }

  public updateSource(source: string) {
    this._video.updateSource(source);
  }

  public destroy() {
    this._video.destroy();
  }
}
