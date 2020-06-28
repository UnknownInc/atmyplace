import { observable, action, computed } from 'mobx'
import Logger from '../Log';
import EventService from '../services/eventservice';
const uuid = require('uuid');

const log = new Logger('SessionStore');

export const MessageTypes = Object.freeze({
  STATUS:'STATUS',
  MESSAGE:'MESSAGE',
  DATA:'DATA'
});
export default class SessionStore {
  @observable
  event=null;

  @observable
  joined=false;

  @observable
  isBusy=false;

  @observable
  lasterror=null;

  @observable
  attendees=[];

  @observable
  messages=[];


  @action 
  async get(eventname) {
    log.info('get');
    this.isBusy=true;
    this.lasterror=null;
    this.event=null;
    this.joined=false;
    this.attendees.replace([]);
    this.messages.replace([]);
    try {
      this.event = await EventService.getByName(eventname);
    } catch (e) {
      log.error(`get ${e}`);
      this.lasterror = `Unable to retrive details for ${eventname}.`;
    } finally {
      this.isBusy=false;
    }
  }

  @action.bound 
  addMessage(data) {
    this.messages.push(data);
  }

  @action.bound sendStatus(from, statusMessage) {
    const {uid, displayName, photoURL} = from;
    this.channel.transmitPublish({
      from: {uid, displayName, photoURL},
      to: 'all',
      type: MessageTypes.STATUS,
      messageid: uuid.v4(),
      message: statusMessage,
      time:(new Date()).toUTCString()
    })
  }

  @action sendMessage(from, message, to='all') {
    const {uid, displayName, photoURL} = from;
    this.channel.transmitPublish({
      from: {uid, displayName, photoURL},
      to: to,
      type: MessageTypes.MESSAGE,
      messageid: uuid.v4(),
      message: message,
      time:(new Date()).toUTCString()
    })
  }

  async sendDesc(uid, desc) {
    const result = await window.socket.invoke('sendDesc',{uid, desc});
    return result;
  }
  async sendIceCandidate(data) {
    const result = await window.socket.invoke('sendIceCandidate',data);
    return result;
  }

  @action
  async join({user, onData}) {
    this.isBusy=true;
    this.lasterror=null;
    try {
      const eid=this.event.id;
      const uid=user.uid;
      await EventService.join(eid, {uid});
      this.joined=true;


      this.rpcGotDescConsumer = window.socket.procedure('gotDesc').createConsumer();
      (async () => {
        // Set up a loop to handle and respond to RPCs.
        for await (let request of this.rpcGotDescConsumer) {
          const {data} = request;
          let found=false;
          for(let i=0;i<this.attendees.length;i++){
            if (this.attendees[i].uid===data.uid) {
              found=true;
              console.log('gotDesc from', data.uid);
              const attendee = this.attendees[i];
              attendee.pc.setRemoteDescription(data.desc);
              attendee.pc.createAnswer()
                .then(desc=>{
                  attendee.pc.setLocalDescription(desc);
                  request.end(desc);
                })
                .catch(e=>{
                  console.error('unable to createAnswer', e)
                })
              break;
            }
          }
          if (!found) {
            request.end(null)
          }
        }
      })();


      this.rpcGotIceConsumer = window.socket.procedure('gotIceCandidate').createConsumer();
      (async () => {
        // Set up a loop to handle and respond to RPCs.
        for await (let request of this.rpcGotIceConsumer) {
          const {data} = request;
          for(let i=0;i<this.attendees.length;i++){
            if (this.attendees[i].uid===data.uid) {
              console.log('gotIceCandidate from', data.uid);
              const attendee = this.attendees[i];
              try {
                attendee.pc.addIceCandidate(data.candidate);
              } catch(e) {
                console.log(e);
              }
              break;
            }
          }
          request.end('ok');
        }
      })();

      this.channel=window.socket.subscribe(this.event.id,{data:{eid, uid}});
      (async () => {
        for await (let data of this.channel.listener('subscribe')){
          log.info(`channel (${eid}) subscribed: ${JSON.stringify(data)}`);
          this.sendStatus(user, 'joined');
        }
      })();

      (async ()=>{
        for await (let data of this.channel) {
          // Consume channel data...
          log.info(`${eid} data: ${JSON.stringify(data)}`);
          let hasUser = false;
          let hasLeft = (data.type===MessageTypes.STATUS && data.message==='left');
          for(let i=0;i<this.attendees.length;i++){
            if (this.attendees[i].uid===data.from.uid) {
              hasUser=true; 
              if (hasLeft) {
                this.attendees[i].pc.close();
                this.attendees.remove(this.attendees[i]);
              }
              break;
            }
          }

          if (!hasUser) {
            const a=Object.assign({pc:new RTCPeerConnection(null)},data.from);
            this.attendees.push(a);
          }

          if (data.type===MessageTypes.MESSAGE || data.type===MessageTypes.STATUS) {
            this.addMessage(data);
          }
          if (onData) {
            (async ()=> { 
              try {
                await onData({eid, data });
              } catch(e) {
                log.error(`error calling onData: ${e}`);
              }
            })();
          }
        }
      })();

      EventService.attendees(eid)
        .then(users=>{
          let attendees=[];
          users.forEach(u=>{
            if (this.attendees.findIndex(a=>a.uid==u.uid)===-1){
              attendees.push(Object.assign({pc:new RTCPeerConnection(null)},u))
            }
          })
          this.attendees.push(...attendees);
        });
    } catch (e) {
      console.error(e);
      log.error(`join ${JSON.stringify(e)}`);
      this.lasterror = `Unable to join event:${this.event.name}.`;
    } finally {
      this.isBusy=false;
    }
  }

  @action
  async exit({user, clearSession}) {
    log.info('exit');
    this.isBusy = true;
    this.lasterror = null;
    try{
      await EventService.exit(this.event.id);
      this.attendees.forEach(a=>{
        if (a.pc) {
          a.pc.close();
        }
      })
      this.attendees.replace([]);
      this.joined=false;
      if (this.rpcGotDescConsumer) {
        this.rpcGotDescConsumer.kill();
        this.rpcGotDescConsumer=null;
      }
      if (this.rpcGotIceConsumer) {
        this.rpcGotIceConsumer.kill();
        this.rpcGotIceConsumer=null;
      }
      this.sendStatus(user, 'left');
      await this.channel.close();
      await this.channel.unsubscribe();
      if (clearSession) {
        this.event=null;
        this.messages.replace([]);
      }
    } catch(e) {
      log.error(`exit ${e}`);
    } finally {
      this.isBusy = false;
    }
  }

  @action
  async create({uid, name, isPublic}) {
    log.info('create');
    this.isBusy=true;
    this.lasterror=null;
    try {
      return await EventService.create({
          uid,
          name,
          isPublic
        });
    } catch (e) {
      log.error(`create ${e}`);
      this.lasterror = 'Unable to create a new event';
    } finally {
      this.isBusy=false;
    }
  }
}