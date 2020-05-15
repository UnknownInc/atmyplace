import React,{useState, useRef, useEffect} from 'react';

import {observer} from 'mobx-react';
import {useStores} from '../hooks';
import { Layout, Row,Col, Button, Space, PageHeader, Spin, Tag } from 'antd';
import {
  LoginOutlined,
  UserAddOutlined,
  AudioMutedOutlined,
  DesktopOutlined,
  CameraOutlined,
  TeamOutlined,
  FullscreenOutlined,
  CaretDownFilled,
  CaretUpFilled
} from '@ant-design/icons';


import Logout from './Logout';
import JoinForm from './JoinForm';

const { Content, } = Layout;


const EventView = observer((props)=>{
    const localVideo = useRef();
    const [isMenuVisible, setMenuVisibility] = useState(true);
    const [isVideoOn, setVideo] = useState(window.localStream ? true : false)
    const appcontext = useStores();
    const {sessionStore, isAuthenticated} = appcontext;
    const {event} = sessionStore; 
    const {history} = props;

    useEffect(()=>{
      if (window.localStream && localVideo.current) {
        localVideo.current.srcObject = window.localStream;
      }
    })
   
    const onCreateSDPError = (error)=>{
      console.error(`Failed to create session description: ${error.toString()}`);
    }

    const gotSDP = async (description) =>{
      window.callerPC.setLocalDescription(description);
      console.log(`SDP`)
      console.dir(description.sdp);
      await sessionStore.join({ld:JSON.stringify(description)});
      /* Now the description must be sent to the peer.
      This tells the peer how to connect.  It could be anything,
      but here we’ll name this method ‘invite’ */
      //invite(description);\
      window.localSDPDescription = description;
    }

    const gotStream = (stream) => {
      console.log('Received local stream');
      localVideo.current.srcObject = stream;
      window.localStream = stream;
      if (window.callerPC) {
        window.localStream.getTracks().forEach((track) =>
          window.callerPC.addTrack(track, window.localStream));
      }
      setVideo(true);
    }

    const toggleVideo = () => {
      if (window.localStream) {
        console.log('stopping video...')
        setVideo(false);
        window.localStream.getTracks().forEach(track => track.stop());
        window.localStream = null;
        return
      } 
      console.log('Requesting local stream');
      navigator.mediaDevices
          .getUserMedia({
            audio: true,
            video: true
          })
          .then(gotStream)
          .catch(e => console.log('getUserMedia() error: ', e));
    }

    const onJoin = async ()=>{
      sessionStore.join({});
      // if (window.callerPC==null) {
      //   console.log('creating peerconnection')
      //   window.callerPC = new RTCPeerConnection();
      // }
      // const offerOptions = {
      //   offerToReceiveAudio: 1,
      //   offerToReceiveVideo: 1
      // };
      // window.callerPC.createOffer(offerOptions)
      //   .then(gotSDP, onCreateSDPError);

      // if (window.localStream) {
      //   console.log('Starting calls');
      //   const audioTracks = window.localStream.getAudioTracks();
      //   const videoTracks = window.localStream.getVideoTracks();
      //   if (audioTracks.length > 0) {
      //     console.log(`Using audio device: ${audioTracks[0].label}`);
      //   }
      //   if (videoTracks.length > 0) {
      //     console.log(`Using video device: ${videoTracks[0].label}`);
      //   }
      //   window.localStream.getTracks().forEach((track) =>
      //     window.callerPC.addTrack(track, window.localStream));
      // }
    }

    const onHangup = (clearSession=false)=>{
      console.log('Ending call');
      if (window.callerPC) {
        window.callerPC.close();
      }
      window.callerPC=null;
      window.localSDPDescription=null;
      sessionStore.exit(clearSession);
    }

    const renderSession = () => {
      const {isPublic, name} = event;
      return <>
        <PageHeader
          onBack={()=>{
            onHangup(true);
          }}
          title={name}
          subTitle=""
          tags={isPublic?<Tag color='blue'>
            public</Tag> : <Tag color='red'>private</Tag>}
          extra={[
            sessionStore.joined ? <Button key='1h'
            type="primary" onClick={_e=>onHangup()}
            >Hang up</Button> : <Button key='1j' type="primary" onClick={onJoin} loading={sessionStore.isBusy}>Join</Button>
          ]}>
        </PageHeader>
        <div style={{backgroundColor:'#001529', color:'white', flex:1, margin: '24px', position:'relative', justifyContent:'center'}}>
          <div style={{position:'absolute', top:0, bottom:0, left: 0, right: 0, overflow:'hidden'}}>
            <video ref={localVideo} playsInline autoPlay muted style={{position:'absolute', 
              height: '100%', width: '177.77777778vh', /* 100 * 16 / 9 */
              minWidth: '100%', minHeight: '56.25vw', /* 100 * 9 / 16 */
              left: '50%',top: '50%', transform: 'translate(-50%, -50%)'}}/>
          </div>
          <div style={{position:'absolute', bottom:0, left: 0, right: 0, justifyContent:'center', display:'flex'}}>
            <div style={{width:300, height:(isMenuVisible?72:14), backgroundColor:'#ffffff0f',  borderRadius:'8px 8px 0px 0px', boxShadow: "0px 0px 16px #00000066",
              display:'flex', flexDirection:'column', overflow: 'hidden', transition: "height 0.2s", transitionTimingFunction:'ease-in-out'
            }}>
              {isMenuVisible?<CaretDownFilled style={{color:'#1690ff'}} 
                onClick={()=>{setMenuVisibility(false)}}/>:<CaretUpFilled style={{color:'#1690ff'}} 
                onClick={()=>{setMenuVisibility(true)}}/>}
              <span style={{height:8}}/>
              <div style={{display:'flex', justifyContent:'center', flexDirection: 'row'}}>
                <Button shape="circle" icon={<TeamOutlined />}></Button> <span style={{width:16}}/>
                <Button shape="circle" icon={<AudioMutedOutlined />}></Button> <span style={{width:16}}/>
                <Button shape="circle" icon={<CameraOutlined/>} style={{backgroundColor:isVideoOn?'#393':'#f66', color:'white'}} onClick={toggleVideo}></Button> <span style={{width:16}}/>
                <Button shape="circle" icon={<DesktopOutlined />}></Button> <span style={{width:16}}/>
                <Button shape="circle" icon={<FullscreenOutlined />}></Button>
              </div>
            </div>
          </div>
          {sessionStore.isBusy?<div style={{
              position:'absolute', top:0, bottom:0, left: 0, right: 0, overflow:'hidden',
              textAlign:'center', background:'#00000066'
            }}
            >
              <div style={{height:128}}></div>
              <Spin size='large'/>
            </div>:null}
        </div>
      </> 
    }
    return <Layout style={{minHeight:'100%'}}>
      {event ? renderSession() : <Content className='center'> 
        <Space direction='vertical'>
        <JoinForm/>
        {isAuthenticated ? <Row>
          <Col span='8'></Col>
          <Col>
            <h4>Not you? <Logout/></h4>
          </Col>
        </Row>:<Row>
          <Col span='8'></Col>
          <Col span='7'>
            <Button type="primary" onClick={()=>history.push("/login")}
              icon={<LoginOutlined />}>Sign In</Button>
          </Col>
          <Col span='2'>
          </Col>
          <Col span='7'>
            <Button type="primary" onClick={()=>history.push("/signup")}
              icon={<UserAddOutlined />}>Sign Up</Button>
          </Col>
        </Row>}
        </Space>
      </Content>}
    </Layout>
});

export default EventView;