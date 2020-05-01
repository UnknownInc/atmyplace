import { observable, action, computed } from 'mobx'
import {auth} from '../services/firebase';
import log from '../Log';
class AuthStore {
  constructor() {}

  @observable
  busy=true;

  @observable
  isAuthenticated = false;

  @observable
  user = {};

  @observable
  idToken = null;

  @computed
  get Authorization () {
    return {"Authorization": `Bearer ${this.idToken}`};
  }

  @action
  async init() {
    log.info('authStore::init');
    this.idToken = window.localStorage.getItem('idToken');
    if (this.idToken==null) {
      this.idToken=null;
      this.isAuthenticated=false;
      log.info('Not authenticated');
      return;
    }

    try {
        await this.fetchProfile();
        this.isAuthenticated=true;
        log.info('is Authenticated');
    } catch(e) {
      log.error(e);
      this.idToken=null;
      this.isAuthenticated=false;
    }
    this.busy=false;
  }

  @action
  async fetchProfile() {
    log.info('authStore:fetchProfile');
    const response = await fetch('/api/user/profile', {
      headers:{...this.Authorization}
    });
    if (response.ok){
      const profile = await response.json();
      this.user = profile||{};
    } else {
      throw response.statusText;
    }
  }

  @action
  async updateProfile(values) {
    log.info('authStore:updateProfile');
    const response = await fetch('/api/user/profile', {
      method: 'POST',
      headers:{
        ...this.Authorization,
        'Content-Type': 'application/json'
      },
      body:JSON.stringify(values)
    });
    if (response.ok){
      const profile = await response.json();
      this.user = profile||{};
    } else {
      throw response.statusText;
    }
  }

  @action
  async signin(email, password) {
    log.info('authStore:signin');
    this.busy=true;
    this.isAuthenticated=false;
    try {
      await auth().setPersistence(auth.Auth.Persistence.LOCAL);
      await auth().signInWithEmailAndPassword(email, password);
      this.idToken = await auth().currentUser.getIdToken();
      window.localStorage.setItem('idToken', this.idToken);
      await this.fetchProfile();
      this.isAuthenticated=true;
    } catch (error) {
      this.isAuthenticated=false;
      if (error.code === 'auth/wrong-password'){
        throw 'Bad email or password.';
      } else {
        throw error.message;
      }
    } finally {
      this.busy=false;
    }
  }

  @action
  logout() {
    this.isAuthenticated=false;
    this.idToken=null;
    this.user = {};
    window.localStorage.setItem('idToken',null);
    auth().signOut().then(()=>{
      log.info('logged out.')
    })
    .catch(e=>log.error(e));
  }
}

const createAuthStore = ()=>{
  const auth=new AuthStore();
  auth.init()
    .then(()=>{
      log.info('finished authStore initialization');
    })
    .catch(e=>console.error(e));
  return auth;
}
export default createAuthStore;