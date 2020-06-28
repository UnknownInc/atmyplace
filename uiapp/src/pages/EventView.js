import React,{useState, useRef, useEffect} from 'react';

import {useParams} from 'react-router-dom'
import {observer} from 'mobx-react';
import {useStores} from '../hooks';
import { 
  Layout, Row,Col, Button, notification, 
  Space, PageHeader, Spin, Tag, Comment, 
  Badge, Tooltip, Avatar,
  Form, Input,
 } from 'antd';
import {
  LoginOutlined,
  UserAddOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  DesktopOutlined,
  CameraOutlined,
  TeamOutlined,
  FullscreenOutlined,
  CaretDownFilled,
  CaretUpFilled,
  CommentOutlined,
  MessageOutlined,
  MessageFilled,
  SoundTwoTone,
  DislikeOutlined, LikeOutlined, DislikeFilled, LikeFilled,
} from '@ant-design/icons';


import Logout from './Logout';
import JoinForm from './JoinForm';
import ChatMessage from './ChatMessage';
import EventAttendee from './EventAttendee';

const { Content, } = Layout;


const ChatEditor = ({ onChange, onSubmit, submitting, value }) => (
  <div>
    <Form.Item>
      <Input.TextArea rows={2} onChange={onChange} defaultValue={value}/>
    </Form.Item>
    <Form.Item>
      <Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary">
        Send
      </Button>
    </Form.Item>
  </div>
);

const packs=[1,4,9,16,25,36,49,64,81];

const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
  voiceActivityDetection: true
};

const EventView = observer((props)=>{
    const { eventid } = useParams();
    const localVideo = useRef();
    const chatRef = useRef();
    const mainPanelRef = useRef();
    const [newChatMessage, setNewChatMessage] = useState('');
    const [isFullScreen, setFullScreen] = useState(document.fullscreenElement!==null)
    const [isChatVisible, setChatVisibility] = useState(false);
    const [isMenuVisible, setMenuVisibility] = useState(true);

    let v=false;let a=false;
    if (window.localStream) {
      const videoTracks = window.localStream.getVideoTracks();
      const audioTracks = window.localStream.getAudioTracks();
      if (videoTracks.length > 0) {
        v=true;
      }
      if (audioTracks.length > 0) {
        a=true;
      }
    }

    const [isVideoOn, setVideo] = useState(v);
    const [isAudioOn, setAudio] = useState(a);

    const appcontext = useStores();
    const {sessionStore, isAuthenticated, user} = appcontext;
    const {event} = sessionStore; 
    const {history} = props;

    if (eventid && eventid!=='' && !sessionStore.isBusy) {
      if (!(event && event.name===eventid)){
        sessionStore.get(eventid)
          .then()
          .catch((e)=>{
            console.error('Bad eventid/name. '+e);
          });
      }
    }

    useEffect(()=>{
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
      document.onfullscreenchange = function ( _e ) { 
        setFullScreen(document.fullscreenElement!==null);
      }; 
      setTimeout(()=>{
        sessionStore.attendees.forEach(a=>{
          if (a.pc.currentLocalDescription===null && a.uid!==user.uid) {
            let co=false;
            if (isAudioOn) {
              const at = window.localStream.getAudioTracks();
              const asenders=[]
              at.forEach(t=>asenders.push(a.pc.addTrack(t, window.localStream)));
              a.asenders=asenders;
              co=true;
            }

            if (isVideoOn) {
              const vt = window.localStream.getVideoTracks();
              const vsenders=[]
              vt.forEach(t=>vsenders.push(a.pc.addTrack(t, window.localStream)));
              a.vsenders=vsenders;
              co=true;
            }
            if (co) {
              _createOffer(a);
            }
          }
        })
      }, 1000);
    });
   
    /* View in fullscreen */
    const openFullscreen=()=>{
      const elem=mainPanelRef.current;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
      }
      setFullScreen(true);
    }

    /* Close fullscreen */
    const closeFullscreen=()=>{
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
      }
      setFullScreen(false);
    }

    const toggleFullscreen=()=>{
     if (document.fullscreenElement!==null) {
       closeFullscreen(); 
     } else {
       openFullscreen();
     }
    }

    const removeTrackFromPC = ({audio, video})=>{
      sessionStore.attendees.forEach(a=>{
        try {
          if (a.uid!==user.uid) {
            if (audio) {
              a.asenders.forEach(t=>a.pc.removeTrack(t));
            }
            if (video) {
              a.vsenders.forEach(t=>a.pc.removeTrack(t));
            }
          }
        } catch(e) {
          
        }
      })
    }

    const createOffers=()=>{
      sessionStore.attendees.forEach(a=>{
        if (a.uid!==user.uid) {
          _createOffer(a);
        }
      })
    }

    const _createOffer=(a)=>{
      let pc = a.pc;
      console.log(`creating offer for ${a.displayName}`);
      pc.createOffer((desc)=>{
        console.log(`got offer for ${a.displayName}`);
        pc.setLocalDescription(desc);
        sessionStore.sendDesc(a.uid, pc.localDescription)
          .then(rdesc=>{
            console.log(`got remote desc from ${a.displayName}`)
            pc.setRemoteDescription(rdesc);
          })
      }, e=>{
        console.log(`Failed to create session description: ${e.toString()} for ${a.displayName}`);
      })
    }

    const toggleAudio = () => {
      let audioTracks = [];
      if (window.localStream){
        audioTracks = window.localStream.getAudioTracks();
      }
      if (audioTracks.length>0) {
        console.log('stopping audio...')
        setAudio(false);
        removeTrackFromPC({audio:true});
        audioTracks.forEach(track => {
          track.stop()
          window.localStream.removeTrack(track);
        });
        const videoTracks = window.localStream.getVideoTracks();
        if (videoTracks.length===0) {
          window.localStream = null;
        }
        createOffers();
        return;
      } 
      console.log('Requesting local audio stream');
      navigator.mediaDevices
        .getUserMedia(Object.assign({},appcontext.localSettings.mediaconstraints,{video:false}))
          .then((stream) => {
            console.log('Received local audio stream');
            const audioTracks = stream.getAudioTracks();
            if (window.localStream) {
              audioTracks.forEach(t=>window.localStream.addTrack(t));
            } else {
              window.localStream = stream;
              if (localVideo.current) {
                localVideo.current.srcObject = null;
                localVideo.current.srcObject = window.localStream;
              }
            }
            sessionStore.attendees.forEach(a=>{
              const asenders=[];
              audioTracks.forEach(t=>asenders.push(a.pc.addTrack(t, window.localStream)));
              a.asenders=asenders;
            })
            createOffers();
            setAudio(true);
          })
          .catch(e => console.log('getUserMedia(audio) error: ', e));
    }

    const toggleVideo = () => {
      let videoTracks = [];
      if (window.localStream){
        videoTracks = window.localStream.getVideoTracks();
      }
      if (videoTracks.length>0) {
        console.log('stopping video...')
        setVideo(false);
        removeTrackFromPC({video:true});
        const videoTracks = window.localStream.getVideoTracks();
        videoTracks.forEach(track => {
          track.stop()
          window.localStream.removeTrack(track);
        });
        const audioTracks = window.localStream.getAudioTracks();
        if (audioTracks.length===0) {
          window.localStream = null;
        }
        createOffers();
        return
      } 
      console.log('Requesting local video stream');
      navigator.mediaDevices
        .getUserMedia(Object.assign({},appcontext.localSettings.mediaconstraints,{audio:false}))
          .then((stream) => {
            console.log('Received local video stream');
            const videoTracks = stream.getVideoTracks();
            if (window.localStream) {
              videoTracks.forEach(t=>window.localStream.addTrack(t));
            } else {
              window.localStream = stream;
              if (localVideo.current) {
                localVideo.current.srcObject = null;
                localVideo.current.srcObject = window.localStream;
              }
            }
            sessionStore.attendees.forEach(a=>{
              const vsenders=[];
              videoTracks.forEach(t=>vsenders.push(a.pc.addTrack(t, window.localStream)));
              a.vsenders=vsenders;
            })
            createOffers();
            setVideo(true);
          })
          .catch(e => console.log('getUserMedia(video) error: ', e));
    }

    const onData = async ({data})=>{
      const {from, message} = data
      if (data.type==='STATUS') {
        notification.open({
          message: `Status`,
          description: `${from.displayName} ${message}`,
          icon: <SoundTwoTone twoToneColor="#52c41a"/>
        });
      }
    }

    const onJoin = async ()=>{
      sessionStore.join({user:appcontext.user, onData: onData});
    }

    const onHangup = ({user, clearSession=false})=>{
      if (isVideoOn) {
        toggleVideo();
      }
      if (isAudioOn) {
        toggleAudio();
      }
      sessionStore.exit({user, clearSession});
    }

    const renderSession = () => {
      const {isPublic, name} = event;
      let awidth=100;
      for(let i=0;i<packs.length;i++) {
        if (sessionStore.attendees.length<=packs[i]) {
          awidth=100/(i+1.0)+"%";
          break;
        }
      }
      return <>
        <PageHeader
          onBack={()=>{
            onHangup({user: appcontext.user, clearSession:true});
          }}
          title={name}
          subTitle=""
          tags={<span>{isPublic?<Tag color='blue'>
            public</Tag> : <Tag color='red'>private</Tag>}<Badge count={sessionStore.attendees.length}></Badge></span>}
          extra={[
            sessionStore.joined ? <Button key='1h'
            type="primary" onClick={_e=>onHangup({user:appcontext.user, clearSession:false})}
            >Hang up</Button> : <Button key='1j' type="primary" onClick={onJoin} loading={sessionStore.isBusy}>Join</Button>
          ]}>
        </PageHeader>
        <div style={{backgroundColor:'#001529', color:'white', flex:1, margin: '24px', position:'relative', justifyContent:'center'}}>
          <div ref={mainPanelRef} style={{position:'absolute', top:0, bottom:0, left:0, right:0, 
            display:'flex', flexWrap:'wrap', alignItems:'center'}}>
            {sessionStore.joined?sessionStore.attendees.map(auser => <EventAttendee key={auser.uid} user={auser} size={awidth} 
              isVideoOn={isVideoOn} isAudioOn={isAudioOn}/>):null}
            <video autoPlay muted playsInline 
              ref={localVideo}
              style={{
                display:sessionStore.joined?'none':'flex',
                // minWidth:'100%', minHeight:'100%', width: 'auto',height: 'auto',
                width: '100%',
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)'}}/>
            {/* chat panel */}
            <div style={{position:'absolute', right:8, top:8, bottom:8, opacity:(isChatVisible?1:0), width:(isChatVisible?'400px':'0px'), padding:8, transition: "all 0.2s", transitionTimingFunction:'ease-in-out',background:'#ffffff33', borderRadius:4}}>
              <div ref={chatRef} style={{position:'absolute',top:0, bottom:170,right:0, left:0, overflow:'scroll', padding:8 }}>
                {sessionStore.messages.map((data,i)=><ChatMessage key={i} data={data}/>)}
              </div>
              {sessionStore.joined?<div style={{position:'absolute', bottom:0, right:8, left:8,}}>
                <Comment
                  avatar={
                    <Avatar
                      src={appcontext.user.photoURL}
                      alt={appcontext.user.displayName}
                    />
                  }
                  content={
                    <ChatEditor
                      onChange={e=>setNewChatMessage(e.target.value)}
                      onSubmit={()=>{
                        sessionStore.sendMessage(appcontext.user, newChatMessage);
                      }}
                      submitting={false}
                      value={newChatMessage}
                    />
                  }
                />
              </div>:null}
            </div>

            {/* bottom panel */}
            <div style={{position:'absolute', bottom:0, left: 0, right: 0, justifyContent:'center', display:'flex', pointerEvents: 'none'}}>
              <div style={{width:300, height:(isMenuVisible?72:14), backgroundColor:'#ffffff0f',  borderRadius:'8px 8px 0px 0px', boxShadow: "0px 0px 16px #00000066",
                display:'flex', flexDirection:'column', overflow: 'hidden', transition: "height 0.2s", transitionTimingFunction:'ease-in-out', pointerEvents:'auto'
              }}>
                {isMenuVisible?<CaretDownFilled style={{color:'#1690ff'}} 
                  onClick={()=>{setMenuVisibility(false)}}/>:<CaretUpFilled style={{color:'#1690ff'}} 
                  onClick={()=>{setMenuVisibility(true)}}/>}
                <span style={{height:8}}/>
                <div style={{display:'flex', justifyContent:'center', flexDirection: 'row'}}>
                  <Button shape="circle" icon={<TeamOutlined />} style={{backgroundColor:'transparent', color:'white'}}></Button> <span style={{width:16}}/>
                  <Button shape="circle" icon={<CommentOutlined/>} style={{backgroundColor:isChatVisible?'#393':'transparent', color:'white'}} onClick={()=>setChatVisibility(!isChatVisible)}></Button> <span style={{width:16}}/>
                  <Button shape="circle" icon={isAudioOn?<AudioOutlined/>:<AudioMutedOutlined />} style={{backgroundColor:isAudioOn?'#393':'#f66', color:'white'}} onClick={toggleAudio}></Button> <span style={{width:16}}/>
                  <Button shape="circle" icon={<CameraOutlined/>} style={{backgroundColor:isVideoOn?'#393':'#f66', color:'white'}} onClick={toggleVideo}></Button> <span style={{width:16}}/>
                  <Button shape="circle" icon={<DesktopOutlined />} style={{backgroundColor:'transparent', color:'white'}}></Button> <span style={{width:16}}/>
                  <Button shape="circle" icon={<FullscreenOutlined />} style={{backgroundColor:isFullScreen?'#393':'transparent', color:'white'}} onClick={toggleFullscreen}></Button>
                </div>
              </div>
            </div>
            
            {/* busy cursor*/}
            {sessionStore.isBusy?<div style={{
                position:'absolute', top:0, bottom:0, left: 0, right: 0, overflow:'hidden',
                textAlign:'center', background:'#00000066'
              }}
              >
                <div style={{height:128}}></div>
                <Spin size='large'/>
              </div>:null}
          </div>
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