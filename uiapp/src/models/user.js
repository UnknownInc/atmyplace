
import { observable, action } from 'mobx';
import Logger from '../Log';
import UserService from '../services/userservice';


const log = new Logger('User');
export default class User {
  constructor(data) {
    this.merge(data);
  }

  @observable
  displayName=''

  @observable
  email
  
  @observable
  photoURL
  
  @observable
  shortDescription
  
  @observable
  uid

  @action
  merge(data) {
    if (data) {
      this.displayName = data.displayName;
      this.email = data.email
      this.photoURL = data.photoURL;
      this.shortDescription = data.shortDescription;
      this.uid = data.uid;
    }
  }

  @action 
  async get() {
    log.info('get');
    const data  = await UserService.get(this.uid);
    this.merge(data);
    return this;
  }

  @action
  async update(values) {
    log.info('update');
    const data  = await UserService.update(this.uid, values);
    this.merge(data);
    return this;
  }
}