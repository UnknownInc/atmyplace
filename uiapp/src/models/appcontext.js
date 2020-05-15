import { observable, action, computed } from 'mobx'
import {auth, db} from '../services/firebase';
import Logger from '../Log';
import SessionStore from './sessionStore';
import User from './user';

const log = new Logger('AppContext');

const isOfflineForDatabase = {
  state: 'offline',
  last_changed: db.ServerValue.TIMESTAMP,
};

const isOnlineForDatabase = {
  state: 'online',
  last_changed: db.ServerValue.TIMESTAMP,
};

export default class AppContext {
  @observable
  sessionStore=new SessionStore();

  @observable
  busy=true;


  @observable
  user;

  @observable
  idToken = null;

  @computed
  get isAuthenticated () {
    return this.idToken !== null;
  }

  @computed
  get authorization () {
    const apiAuth = {"Authorization": `Bearer ${this.idToken}`};
    return apiAuth;
  }

  setConnectionStateListener() {
    // Fetch the current user's ID from Firebase Authentication.
    var uid = this.user.uid;

    // Create a reference to this user's specific status node.
    // This is where we will store data about being online/offline.
    this.userStatusDatabaseRef = db().ref(`atmyplace_users/${uid}`);

    if (this.statusUpdater) {
      this.userStatusDatabaseRef.set(isOnlineForDatabase);
      return;
    }

    // Create a reference to the special '.info/connected' path in 
    // Realtime Database. This path returns `true` when connected
    // and `false` when disconnected.
    this.statusUpdater = db().ref('.info/connected').on('value', (snapshot) => {
      // If we're not currently connected, don't do anything.
      if (snapshot.val() === false) {
          return;
      }

      if (!this.userStatusDatabaseRef) return;

      // If we are currently connected, then use the 'onDisconnect()' 
      // method to add a set which will only trigger once this 
      // client has disconnected by closing the app, 
      // losing internet, or any other means.
      this.userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(()=>{
        // The promise returned from .onDisconnect().set() will
        // resolve as soon as the server acknowledges the onDisconnect() 
        // request, NOT once we've actually disconnected:
        // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

        // We can now safely set ourselves as 'online' knowing that the
        // server will mark us as offline once we lose connection.
        this.userStatusDatabaseRef.set(isOnlineForDatabase);
      }).catch(function(e) {
        console.error(e);
      })
    });
  }

  @action
  async init() {
    log.info('init');

    this.busy=true;
    this.idToken = window.localStorage.getItem('idToken');
    window.apiAuth = this.authorization;

    if (!this.idToken) {
      log.info('Not authenticated');
      return;
    }

    try {
      this.user = new User();
      await this.user.get();
      this.setConnectionStateListener()
    } catch(e) {
      log.error(e);
      this.idToken=null;
    }
    finally {
      this.busy=false;
    }
  }

  @action
  async signin(email, password) {
    log.info('signin');
    this.busy=true;
    this.idToken=null;
    try {
      await auth().setPersistence(auth.Auth.Persistence.LOCAL);
      await auth().signInWithEmailAndPassword(email, password);

      this.idToken = await auth().currentUser.getIdToken();
      window.localStorage.setItem('idToken', this.idToken);
      window.apiAuth = this.authorization;

      this.user = new User();
      await this.user.get();

      this.setConnectionStateListener();

    } finally {
      this.busy=false;
    }

  }

  @action
  logout() {
    log.info('logout');
    this.sessionStore.exit();
    this.idToken = null;
    this.user = null;
    window.apiAuth = null;
    window.localStorage.setItem('idToken',null);
    if (this.userStatusDatabaseRef) {
      this.userStatusDatabaseRef.set(isOfflineForDatabase);
      this.userStatusDatabaseRef=null;
    }
    auth().signOut().then(()=>{
      log.info('logged out.')
    })
    .catch(e=>log.error(e));
  }

  static create = ()=>{
    log.info('create')
    const auth=new AppContext();
    auth.init()
      .then(()=>{
        log.info('finished authStore initialization');
      })
      .catch(e=>log.error(e));
    return auth;
  }
}
