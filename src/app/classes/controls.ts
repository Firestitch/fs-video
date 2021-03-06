import { NgZone } from '@angular/core';
import FullscreenApi from '../helpers/fullscreen-events';
import { Video } from './video';


export class Controls {

  private _controlsContainer: HTMLElement;
  private _playButton: HTMLElement;
  private _pauseButton: HTMLElement;
  private _muteButton: HTMLElement;
  private _unmuteButton: HTMLElement;
  private _fullscreenOn: HTMLElement;
  private _fullscreenOff: HTMLElement;
  private _volumeContainer: HTMLElement;
  private _volumeLevel: HTMLElement;
  private _volume: HTMLInputElement;

  private _overlayPauseLayout: HTMLElement;

  // Handlers
  private _onPlayHandler: EventListener;
  private _onPauseHandler: EventListener;
  private _switchPlayHandler: EventListener;
  private _switchMuteHandler: EventListener;
  private _switchFullscreenHandler: EventListener;
  private _fullscreenChangeHandler: EventListener;
  private _volumeChangeHandler: EventListener;
  private _showVolumeHandler: EventListener;
  private _hideVolumeHandler: EventListener;

  private _showControlsHandler: EventListener;
  private _hideControlsHandler: EventListener;


  constructor(private _player: Video,
              private _zone: NgZone,
              private _hideControls = false) {

    this._playButton        = this._player.containerTag.querySelector(`#play`);
    this._pauseButton       = this._player.containerTag.querySelector(`#pause`);
    this._muteButton        = this._player.containerTag.querySelector(`#mute`);
    this._unmuteButton      = this._player.containerTag.querySelector(`#unmute`);
    this._fullscreenOn      = this._player.containerTag.querySelector(`#full-screen-on`);
    this._fullscreenOff     = this._player.containerTag.querySelector(`#full-screen-off`);
    this._volume            = this._player.containerTag.querySelector(`#volume`);
    this._volumeLevel       = this._player.containerTag.querySelector(`#vol-level`);
    this._volumeContainer   = this._player.containerTag.querySelector(`#volume-container`);
    this._controlsContainer = this._player.containerTag.querySelector(`#controls`);

    this._overlayPauseLayout = this._player.containerTag.querySelector(`#overlay`);

    this.changeVolume(); // set default volume level

    this.events();
  }

  /**
   * Subscribe to events
   */
  private events() {
    this._onPlayHandler = this.play.bind(this);
    this._onPauseHandler = this.pause.bind(this);
    this._switchPlayHandler = this.switchPlay.bind(this);
    this._switchMuteHandler = this.switchMute.bind(this);
    this._switchFullscreenHandler = this.switchFullscreen.bind(this);
    this._fullscreenChangeHandler = this.fullscreenChangeHandler.bind(this);
    this._volumeChangeHandler = this.changeVolume.bind(this);
    this._showVolumeHandler = this.showVolumeScale.bind(this);
    this._hideVolumeHandler = this.hideVolumeScale.bind(this);
    this._showControlsHandler = this.hoverShowControls.bind(this);
    this._hideControlsHandler = this.checkUserActivity.bind(this);

    // Other events
    this._playButton && this._playButton.addEventListener('click', this._onPlayHandler);
    this._pauseButton && this._pauseButton.addEventListener('click', this._onPauseHandler);
    this._muteButton && this._muteButton.addEventListener('click', this._switchMuteHandler);
    this._unmuteButton && this._unmuteButton.addEventListener('click', this._switchMuteHandler);
    this._fullscreenOn && this._fullscreenOn.addEventListener('click', this._switchFullscreenHandler);
    this._fullscreenOff && this._fullscreenOff.addEventListener('click', this._switchFullscreenHandler);
    this._overlayPauseLayout && this._overlayPauseLayout.addEventListener('click', this._switchPlayHandler);
    this._volume && this._volume.addEventListener('input', this._volumeChangeHandler);

    this._zone.runOutsideAngular(() => {
      this._muteButton && this._muteButton.addEventListener('mouseover', this._showVolumeHandler);
      this._muteButton && this._muteButton.addEventListener('mouseout', this._hideVolumeHandler);
      this._volumeContainer && this._volumeContainer.addEventListener('mouseover', this._showVolumeHandler);
      this._volumeContainer && this._volumeContainer.addEventListener('mouseout', this._hideVolumeHandler);
      this._controlsContainer && this._controlsContainer.addEventListener('mouseover', this._showControlsHandler);
      this._controlsContainer && this._controlsContainer.addEventListener('mouseout', this._hideControlsHandler);
    });

    // Full screen
    this._player.containerTag.addEventListener(FullscreenApi.fullscreenchange, this._fullscreenChangeHandler);
  }

  /**
   * Start playing
   */
  public play() {
    this._playButton && this._playButton.classList.add('hidden');
    this._pauseButton && this._pauseButton.classList.remove('hidden');
    this._player.videoTag.play();
    this._player.playing = true;
    this._player.userActivity = true;
    this.hideOverlayPauseLayout();
  }

  public hoverShowControls() {
    this._player.stopCheckingUserActivity();
  }

  public checkUserActivity() {
    this._player.checkUserActivity();
  }

  /**
   * Stop playing
   */
  public pause() {
    this._playButton && this._playButton.classList.remove('hidden');
    this._pauseButton && this._pauseButton.classList.add('hidden');
    this._player.videoTag.pause();
    this._player.playing = false;
    this.showControls();
    this.showOverlayPauseLayout();
  }

  /**
   * Mute (on/off)
   */
  public switchMute() {
    this._player.muted = !this._player.muted;

    if (this._player.muted) {
      this._unmuteButton.classList.remove('hidden');
      this._muteButton.classList.add('hidden');
      this.hideVolumeScale();
    } else {
      this._muteButton.classList.remove('hidden');
      this._unmuteButton.classList.add('hidden');
    }

    this._player.videoTag.muted = this._player.muted;
  }

  /**
   * Fullscreen on/off
   */
  public switchFullscreen() {
    this.setFullscreenStatus(!this._player.isFullscreenMode);
  }

  /**
   * Change full screen status (on/off)
   * @param status
   */
  public setFullscreenStatus(status: boolean) {
    if (this._player.isFullscreenMode) {
      document[FullscreenApi.exitFullscreen]();
    } else {
      this._player.containerTag[FullscreenApi.requestFullscreen]();
    }

    this._player.isFullscreenMode = status;
  }

  /**
   * Fullscreen change handler(on/off)
   */
  public fullscreenChangeHandler() {
    const targetElem = document[FullscreenApi.fullscreenElement];

    if (!targetElem && this._player.isFullscreenMode) {
      this.setFullscreenStatus(false);
    }

    if (!this._player.isFullscreenMode) {
      this._fullscreenOn.classList.remove('hidden');
      this._fullscreenOff.classList.add('hidden');
      this._player.containerTag.classList.remove('full-screen-mode');
    } else {
      this._fullscreenOn.classList.add('hidden');
      this._fullscreenOff.classList.remove('hidden');
      this._player.containerTag.classList.add('full-screen-mode');
    }
  }

  /**
   * Hide controls
   */
  public hideControls() {
    this._controlsContainer.classList.add('hidden');
    this._player.containerTag.classList.add('hide-cursor');
    this._overlayPauseLayout && this._overlayPauseLayout.classList.add('hidden');
  }

  /**
   * Show controls
   */
  public showControls() {
    this._controlsContainer.classList.remove('hidden');
    this._player.containerTag.classList.remove('hide-cursor');
    this._overlayPauseLayout && this._overlayPauseLayout.classList.remove('hidden');
  }

  /**
   * Change volume and set the current level
   */
  public changeVolume() {
    const scaleTo = +this._volume.value / 100;
    this._player.videoTag.volume = scaleTo;
    this._volumeLevel.setAttribute('style', `transform: scaleY(${scaleTo}) rotate(-90deg)`);
  }

  /**
   * Switch play or pause
   */
  public switchPlay() {
   this._player.playing ? this.pause() : this.play();
  }

  /**
   * Show volume scale on hover
   */
  private showVolumeScale() {
    if (!this._player.muted) {
      this._volumeContainer.hidden = false;
      this.switchVolume();
    }
  }

  /**
   * Hide volume scale
   */
  private hideVolumeScale() {
    this._volumeContainer.hidden = true;
    this.switchVolume();
  }

  /**
   * Switch volume scale
   */
  private switchVolume() {
    this._volume.hidden = this._volumeContainer.hidden;
    this._volumeLevel.hidden = this._volumeContainer.hidden;
  }

  /**
   * Show overlay layout with pause icon
   */
  private showOverlayPauseLayout() {
    this._overlayPauseLayout && this._overlayPauseLayout.classList.remove('playing');
  }

  /**
   * Hide overlay layout with pause icon
   */
  private hideOverlayPauseLayout() {
    this._overlayPauseLayout && this._overlayPauseLayout.classList.add('playing');
  }

  /**
   * Destroy everything
   */
  public destroy() {
    this._playButton && this._playButton.removeEventListener('click', this._onPlayHandler);
    this._pauseButton && this._pauseButton.removeEventListener('click', this._onPauseHandler);
    this._muteButton && this._muteButton.removeEventListener('click', this._switchMuteHandler);
    this._muteButton && this._muteButton.removeEventListener('mouseover', this._showVolumeHandler);
    this._muteButton && this._muteButton.removeEventListener('mouseout', this._hideVolumeHandler);
    this._unmuteButton && this._unmuteButton.removeEventListener('click', this._switchMuteHandler);
    this._fullscreenOn && this._fullscreenOn.removeEventListener('click', this._switchFullscreenHandler);
    this._fullscreenOff && this._fullscreenOff.removeEventListener('click', this._switchFullscreenHandler);
    this._overlayPauseLayout &&  this._overlayPauseLayout.removeEventListener('click', this._switchPlayHandler);
    this._volumeContainer && this._volumeContainer.removeEventListener('mouseover', this._showVolumeHandler);
    this._volumeContainer && this._volumeContainer.removeEventListener('mouseout', this._hideVolumeHandler);
    this._volume && this._volume.removeEventListener('input', this._volumeChangeHandler);
    this._controlsContainer && this._controlsContainer.removeEventListener('mouseover', this._showControlsHandler);
    this._controlsContainer && this._controlsContainer.removeEventListener('mouseout', this._hideControlsHandler);

    this._player.containerTag.removeEventListener(FullscreenApi.fullscreenchange, this._fullscreenChangeHandler);
  }

}
