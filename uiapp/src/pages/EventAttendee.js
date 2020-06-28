import React,{useState, useRef, useEffect} from 'react';

import {observer} from 'mobx-react';
import {useStores} from '../hooks';
import {} from '../helpers/stats';
import { 
  Avatar,
 } from "antd";


const EventAttendee = observer((props)=>{
  const pc = props.user.pc;
  const videoRef = useRef();
  const canvasRef = useRef();
  const statsRef= useRef();
  const {user, sessionStore} = useStores();
  const isLocal = props.user.uid===user.uid
  let statsTimer;
  let prevState={
    bytes:null,
    timestamp:null
  };

  const stateCallback = ()=>{
    let state;
    if (pc) {
      state = pc.signalingState || pc.readyState;
      if (state==='stable'){
        prevState.bytes=null;
        prevState.timestampPrev=null;
      }
      console.log(`pc state change callback, state: ${state} for user ${props.user.displayName}`);
      if (pc.state==='closed' && videoRef.current.srcObject){
        videoRef.current.srcObject=null;
      }
    }
  }

  const iceStateCallback = ()=>{
    let iceState;
    if (pc) {
      iceState = pc.iceConnectionState;
      console.log(`pc ICE connection state change callback, state: ${iceState}`);
    }
  }
  const connStateCallback = ()=>{
    if (pc) {
      const {connectionState} = pc;
      console.log(`pc connection state: ${connectionState} for user ${props.user.displayName}`);
    }
  }

  const onIceCandidate =(e)=>{
    console.log('Candidate remotePeerConnection', e);
    sessionStore.sendIceCandidate({uid:props.user.uid, candidate: e.candidate})
      .then(()=>{
        console.log('Ice Candidate success');
      })
      .catch(e=>{
        console.error('onIceCandidate error', e)
      })
  }

  const gotRemoteStream = (e)=>{
    console.log('gotRemoteStream', e);
    // reset srcObject to work around minor bugs in Chrome and Edge.
    videoRef.current.srcObject = null;
    videoRef.current.srcObject=e.streams[0];
    //clearTimeout(statsTimer);
    //getstats();
  }

  let getstats=async ()=>{
    let state = pc.signalingState || pc.readyState;
    if (state==='stable' && pc.currentRemoteDescription){
      pc.getStats(null)
        .then((results)=>{
          // calculate video bitrate
          results.forEach(report => {
            const now = report.timestamp;

            let bitrate;
            if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
              const bytes = report.bytesReceived;
              if (prevState.timestamp && prevState.timestamp!=now) {
                console.log(`${prevState.timestamp}`)
                bitrate = 8 * (bytes - prevState.bytes) / (now - prevState.timestamp);
                bitrate = Math.floor(bitrate);
              }
              prevState.bytes = bytes;
              prevState.timestamp = now;
            }
            if (bitrate) {
              bitrate += ' kbits/sec';
              statsRef.current.innerHTML = `<strong>Bitrate:</strong>${bitrate}`;
            }
          });
        })
    }
    statsTimer = setTimeout(getstats, 1000);
  }

  useEffect(()=>{
    console.log(`Attendee ${props.user.displayName} visible`);
    pc.onsignalingstatechange = stateCallback;
    pc.oniceconnectionstatechange = iceStateCallback;
    pc.onconnectionstatechange = connStateCallback;

    pc.onicecandidate = onIceCandidate;
    pc.ontrack = gotRemoteStream;
    
    return ()=>{
      console.log(`Attendee ${props.user.displayName} hidden`);
      clearTimeout(statsTimer);
    }
  },[]);

  useEffect(()=>{
    // pc.onsignalingstatechange = stateCallback;
    // pc.oniceconnectionstatechange = iceStateCallback;
    // pc.onconnectionstatechange = connStateCallback;

    // pc.onicecandidate = onIceCandidate;
    // pc.ontrack = gotRemoteStream;

    if (props.isVideoOn || props.isAudioOn ) {
      if (isLocal && videoRef.current.srcObject!==window.localStream) {
        const videoTracks = window.localStream.getVideoTracks();
        const audioTracks = window.localStream.getAudioTracks();
        if (videoTracks.length > 0) {
          console.log(`Using Video device: ${videoTracks[0].label}`);
        }
        if (audioTracks.length > 0) {
          console.log(`Using Audio device: ${audioTracks[0].label}`);
        }
        videoRef.current.srcObject = window.localStream;
        return;
      }
    }
  });


  return <div style={{position:'relative', width:props.size, height:props.size, background:'#6666', overflow:'hidden'}}>
    <video ref={videoRef} autoPlay muted playsInline 
      style={{
        // minWidth:'100%', minHeight:'100%', width: 'auto',height: 'auto',
        width: '100%',
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)'}}/>
    <canvas ref={canvasRef}/>
    <div style={{position:'absolute', top:0, left:0, padding:8}}>
      <Avatar src={props.user.photoURL} />
      <span style={{color:'white'}}>{props.user.displayName}</span>
    </div>
    <div style={{position:'absolute', bottom:0, right:0, padding:8}}>
      <div ref={statsRef}></div>
    </div>
  </div>
 });

 export default EventAttendee;