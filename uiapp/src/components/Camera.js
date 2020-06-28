import React from 'react';

import Stats from 'stats.js';

const doNothing = function(){};

export default class Camera extends React.Component {

  static defaultProps = {
    autoStart: false,
    fps:30,
    width: 640,
    height: 480,
    mirror: false,
    onError: doNothing,
    onFrame: doNothing,
    onNotSupported:doNothing,
    onSuccess: doNothing,
  }
  constructor(props) {
    super(props);
    this.state={
      isCapturing: props.autoStart===true,
    }
  }

  componentDidMount() {
    if (!window.stats) {
      const stats = new Stats();
      stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      stats.dom.style="position:absolute;right:0;top:0";
      document.body.appendChild( stats.dom );
      window.stats=stats;
    }
    this.initVideoStream();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.fps!==this.props.fps ||
      prevProps.width!==this.props.width ||
      prevProps.height!==this.props.height ||
      prevProps.mirror!==this.props.mirror ||
      prevProps.targetCanvas !== this.props.targetCanvas ||
      prevProps.videodevice !== this.props.videodevice 
      // prevProps.onSuccess === this.props.onSuccess &&
      // prevProps.onError === this.props.onError &&
      // prevProps.onNotSupported === this.props.onNotSupported &&
      // prevProps.onFrame !== this.props.onFrame
      ) {
      console.log('didUpdate');

      const isCapturing = this.state.isCapturing;
      if (isCapturing) {
        this.pauseCapture();
      }
      this.setState({isCapturing: true})
      this.initVideoStream();
    }
  }

  initVideoStream = ()=>{
    console.log('initVideoStream');
    let video = window.localVideo;
    
    if (!video){
      video = window.localVideo = document.createElement("video");

      video.onloadedmetadata = (e)=>{
        console.log(e);
      }
    }
		video.setAttribute('width', this.props.width);
		video.setAttribute('height', this.props.height);
		video.setAttribute('playsinline', 'true');
		video.setAttribute('webkit-playsinline', 'true');

		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

		if (navigator.getUserMedia) {
      const constraints={
				video: {
          width: this.props.width,
          height: this.props.height,
          frameRate: this.props.fps,
        },
				audio:false,
      };
      if (this.props.videodevice) {
        constraints.video.deviceId = this.props.videodevice;
      }
      console.log(constraints);
			navigator.getUserMedia(constraints, (stream) => {
				this.props.onSuccess();

				if (video.mozSrcObject !== undefined) { // hack for Firefox < 19
					video.mozSrcObject = stream;
				} else {
					video.srcObject = stream;
				}
        if (this.state.isCapturing) {
          this.startCapture();
        }
			}, this.props.onError);
		} else {
			this.props.onNotSupported();
		}
  }

  initCanvas=()=>{
    console.log('initCanvas');
    const {targetCanvas, height, width, mirror} = this.props;
    this.canvas = targetCanvas||document.createElement("canvas");
		this.canvas.setAttribute('width', width);
		this.canvas.setAttribute('height', height);

    this.context = this.canvas.getContext('2d');
		// mirror video
		if (mirror) {
			this.context.translate(this.canvas.width, 0);
			this.context.scale(-1, 1);
		}
  }

	startCapture=()=>{
    this.initCanvas();
    console.log('startCapture');
    const video = window.localVideo;
    const context = this.context;
		video.play();

    this.setState({isCapturing: true});

		this.renderTimer = setInterval(()=>{
			try {
        window.stats.begin();
				context.drawImage(video, 0, 0, video.width, video.height);
        const imageData = context.getImageData(0, 0, video.width, video.height);
				this.props.onFrame(imageData);
        window.stats.end();
			} catch (e) {
				console.error(e);
			} finally {
      }
		}, Math.round(1000 / this.props.fps));
	}

	stopCapture = () => {
    console.log('stopCapture');
    const video = window.localVideo;
		this.pauseCapture();

		if (video.mozSrcObject !== undefined) {
			video.mozSrcObject = null;
		} else {
			video.srcObject = null;
		}
	}

	pauseCapture = ()=>{
    console.log('pauseCapture');
    const video = window.localVideo;
		if (this.renderTimer) clearInterval(this.renderTimer);
    video.pause();
    this.setState({isCapturing: false})
  }
  
  componentWillUnmount() {
    this.pauseCapture();
  }

  render() {
    return <div>
    </div>
  }
}