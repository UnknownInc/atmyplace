import { observable, action, computed, toJS } from 'mobx'
import Logger from '../Log';

const log = new Logger('SettingsStore');

export default class SettingsStore {
  constructor() {
    log.info('ctor');
    let data=window.localStorage.getItem('localSettings');
    if (data) {
      // log.info('initial data: '+data)
      try {
        this.setValues(JSON.parse(data));
      } catch (e) {
        log.error(e);
      }
    }
  }

  @observable
  size=0;

  @observable
  mirror=false;

  @observable
  fps=30;

  @observable
  videodevice;

  @observable
  audioinputdevice;

  @observable
  audiooutputdevice;

  @computed 
  get width() {
    switch(this.size){
      case 0:
        return 854;
      case 1:
        return 1280;
      case 2:
        return 1920;
      default:
        return 854;
    }
  }

  @computed 
  get height() {
    switch(this.size){
      case 0:
        return 480;
      case 1:
        return 720;
      case 2:
        return 1080;
      default:
        return 480;
    }
  }

  @computed
  get mediaconstraints() {
    const constraints = {
      video: {
        width: this.width,
        height: this.height,
        frameRate: this.fps
      },
      audio: {},
    };

    if (this.videodevice) {
      constraints.video.deviceId = this.videodevice;
    }

    if (this.audioinputdevice) {
      constraints.audio.deviceId = this.audioinputdevice;
    }
    return constraints;
  }

  @action
  setSize(size) {
    this.setValues(Object.assign({}, toJS(this),{size}));
  }

  @action
  setFPS(fps) {
    this.setValues(Object.assign({}, toJS(this),{fps}));
  }

  @action
  setVideoDeviceId(videodevice) {
    log.info(`Video Device: ${videodevice}`);
    this.setValues(Object.assign({}, toJS(this),{videodevice}));
  }

  @action
  setAudioInputDeviceId(audioinputdevice) {
    this.setValues(Object.assign({}, toJS(this),{audioinputdevice}));
  }

  @action
  setAudioOutputDeviceId(audiooutputdevice) {
    this.setValues(Object.assign({}, toJS(this),{audiooutputdevice}));
  }

  @action
  setValues(data) {
    const {size, fps, mirror, videodevice, audioinputdevice, audiooutputdevice} = data;
    this.size = size;
    this.mirror = mirror;
    this.fps = fps;
    this.videodevice = videodevice;
    this.audioinputdevice = audioinputdevice;
    this.audiooutputdevice = audiooutputdevice;

    window.localStorage.setItem('localSettings', JSON.stringify({
      size: this.size,
      fps: this.fps,
      mirror: this.mirror,
      videodevice: this.videodevice,
      audioinputdevice: this.audioinputdevice,
      audiooutputdevice: this.audiooutputdevice,
    }));
  }

  async getMediaDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      log.warn("enumerateDevices() not supported.");
      return;
    }

    try {
      // List cameras and microphones.
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices;
    } catch (err) {
      log.error(err.name + ": " + err.message);
    };
  }
}