import { observable, action, computed } from 'mobx'
import {auth, db} from '../services/firebase';
import Logger from '../Log';
import SessionStore from './sessionStore';
import SettingsStore from './localSettings';
import User from './user';
const socketClusterClient = require("socketcluster-client");

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
  localSettings;

  @observable
  rtcservers=null;

  @observable
  socket=null;

  @observable
  connectionState='offline';

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
    this.localSettings = new SettingsStore();

    let options;
    if (process.env.NODE_ENV!=='production') {
      options={
        hostname: 'localhost',
        port: 8080,
        autoConnect: false
      }
    } else {
      options={
        autoConnect: false
      };
    }
    window.socket = socketClusterClient.create(options);
    
    (async () => {
      for await (let data of window.socket.listener('error')) {
        log.error(`socket error: ${JSON.stringify(data)}`);
        if (data.error && data.error.code===1006) {
          this.connectionState='offline';
        }
      }
      log.warn('socket "error" listener was closed.');
      this.connectionState='offline';
    })();

    (async () => {
      for await (let _data of window.socket.listener('connecting')) {
        this.connectionState='connecting';
        log.info(`socket connecting...`);
      }
      log.warn('socket "connecting" listener was closed.');
      this.connectionState='offline';
    })();

    (async () => {
      for await (let data of window.socket.listener('connect')) {
        this.connectionState='online';
        log.info(`socket connected: ${JSON.stringify(data)}`);
        this.register();
      }
      log.warn('socket "connect" listener was closed.');
      this.connectionState='offline';
    })();

    window.socket.connect();

    this.idToken = window.localStorage.getItem('idToken');
    window.apiAuth = this.authorization;

    if (!this.idToken) {
      this.busy=false;
      log.info('Not authenticated');
      return;
    }

    try {
      this.user = new User();
      await this.user.get();
      await window.socket.invoke('register',{uid: this.user.uid});
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
      this.register();
      this.setConnectionStateListener();

    } finally {
      this.busy=false;
    }

  }

  @action
  logout() {
    log.info('logout');
    this.sessionStore.exit();
    this.unregister();
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

  @action
  register(){
    if (this.connectionState==='online' && this.user) {
      window.socket.invoke('register',{uid: this.user.uid})
        .then(()=>{
          log.info(`Registered user ${this.user.uid}`);
        })
        .catch(e=>{
          log.error('Unable to register user', e);
        })
    }
  }

  @action
  unregister(){
    if (this.connectionState==='online' && this.user) {
      window.socket.invoke('unregister',{uid: this.user.uid})
        .then(()=>{
          log.info(`Unregistered user ${this.user.uid}`);
        })
        .catch(e=>{
          log.error('Unable to unregister user', e);
        })
    }
  }

  @action 
  refreshToken(usr) {
      let refresh = false;
      const appContext = this;
      const docCookies = {
        getItem: function (sKey) {
          if (!sKey || !this.hasItem(sKey)) { return null; }
          return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
        },
        hasItem: function (sKey) {
          return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
        }
      };

      (function poll(){
        var dt = new Date();
        var timeout = 55*60*1000;
        console.log(docCookies.getItem('firebaseAccessTimer')- dt.getTime() );
        if (docCookies.getItem('firebaseAccessTimer') - dt.getTime() < 0) {
          refresh = true;
        }

        if (usr) {
          console.log('user signed-in');
          if (refresh) {console.log('refresing accessToken');}
          usr.getIdToken(refresh).then(function(accessToken) {
            appContext.idToken = accessToken;
            window.localStorage.setItem('idToken', accessToken);
            window.apiAuth = appContext.authorization;
            appContext.register();

            if (accessToken === docCookies.getItem('firebaseAccessToken')) {
              window.setTimeout(poll, docCookies.getItem('firebaseAccessTimer') - dt.getTime());
            } else {
              document.cookie = "firebaseAccessToken=" + accessToken + '; path=/';
              document.cookie = "firebaseAccessTimer=" + (dt.getTime() + timeout) + '; path=/';
              window.setTimeout(poll, timeout);
            }
            if (document.getElementById("firebaseAccessToken")) {
              document.getElementById("firebaseAccessToken").value = accessToken;
            }
          });

        } else {
          console.log('user signed-out');
          appContext.idToken = null;
          appContext.user = null;
          window.apiAuth = null;
          window.localStorage.setItem('idToken',null);
          document.cookie = 'firebaseAccessTimer=0; path=/';
          // window.location.href = '/login?signInSuccessUrl=' + encodeURIComponent(window.location.pathname);
        }
      })();
  }

  static create = ()=>{
    log.info('create')
    const appContext=new AppContext();

    auth().onAuthStateChanged(appContext.refreshToken.bind(appContext));
    appContext.init()
      .then(()=>{
        log.info('finished authStore initialization');
      })
      .catch(e=>log.error(e));
    return appContext;
  }
}
