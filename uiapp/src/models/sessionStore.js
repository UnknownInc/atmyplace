import { observable, action } from 'mobx'
import {db} from '../services/firebase';
import Logger from '../Log';
import EventService from '../services/eventservice';

const log = new Logger('SessionStore');

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
  connections=[];

  @action 
  async get(eventname) {
    log.info('get');
    this.isBusy=true;
    this.lasterror=null;
    this.event=null;
    this.joined=false;
    this.connections=[];
    try {
      this.event = await EventService.getByName(eventname);
    } catch (e) {
      log.error(`get ${e}`);
      this.lasterror = `Unable to retrive details for ${eventname}.`;
    } finally {
      this.isBusy=false;
    }
  }

  @action
  async join(data) {
    this.isBusy=true;
    this.lasterror=null;
    try {
      await EventService.join(this.event.id, data);
      this.joined=true;
    } catch (e) {
      log.error(`join ${e}`);
      this.lasterror = `Unable to join event:${this.event.name}.`;
    } finally {
      this.isBusy=false;
    }
  }

  @action
  async exit(clearSession) {
    log.info('exit');
    this.isBusy = true;
    this.lasterror = null;
    try{
      await EventService.exit(this.event.id);
      this.joined=false;
      if (clearSession) {
        this.event=null;
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