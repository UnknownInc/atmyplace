import cc from './consoleColors';
import admin,{db} from './services/firebase';
const http = require('http');
const eetase = require('eetase');
const socketClusterServer = require('socketcluster-server');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const morgan = require('morgan');
const uuid = require('uuid');
const sccBrokerClient = require('scc-broker-client');

const ENVIRONMENT = process.env.ENV || 'dev';
const SOCKETCLUSTER_PORT = process.env.SOCKETCLUSTER_PORT || (process.env.PORT || 8080);
const SOCKETCLUSTER_WS_ENGINE = process.env.SOCKETCLUSTER_WS_ENGINE || 'ws';
const SOCKETCLUSTER_SOCKET_CHANNEL_LIMIT = Number(process.env.SOCKETCLUSTER_SOCKET_CHANNEL_LIMIT) || 1000;
const SOCKETCLUSTER_LOG_LEVEL = process.env.SOCKETCLUSTER_LOG_LEVEL || 2;

const SCC_INSTANCE_ID = uuid.v4();
const SCC_STATE_SERVER_HOST = process.env.SCC_STATE_SERVER_HOST || null;
const SCC_STATE_SERVER_PORT = process.env.SCC_STATE_SERVER_PORT || null;
const SCC_MAPPING_ENGINE = process.env.SCC_MAPPING_ENGINE || null;
const SCC_CLIENT_POOL_SIZE = process.env.SCC_CLIENT_POOL_SIZE || null;
const SCC_AUTH_KEY = process.env.SCC_AUTH_KEY || null;
const SCC_INSTANCE_IP = process.env.SCC_INSTANCE_IP || null;
const SCC_INSTANCE_IP_FAMILY = process.env.SCC_INSTANCE_IP_FAMILY || null;
const SCC_STATE_SERVER_CONNECT_TIMEOUT = Number(process.env.SCC_STATE_SERVER_CONNECT_TIMEOUT) || null;
const SCC_STATE_SERVER_ACK_TIMEOUT = Number(process.env.SCC_STATE_SERVER_ACK_TIMEOUT) || null;
const SCC_STATE_SERVER_RECONNECT_RANDOMNESS = Number(process.env.SCC_STATE_SERVER_RECONNECT_RANDOMNESS) || null;
const SCC_PUB_SUB_BATCH_DURATION = Number(process.env.SCC_PUB_SUB_BATCH_DURATION) || null;
const SCC_BROKER_RETRY_DELAY = Number(process.env.SCC_BROKER_RETRY_DELAY) || null;

let agOptions = {};

if (process.env.SOCKETCLUSTER_OPTIONS) {
  let envOptions = JSON.parse(process.env.SOCKETCLUSTER_OPTIONS);
  Object.assign(agOptions, envOptions);
}

let httpServer = eetase(http.createServer());
let agServer = socketClusterServer.attach(httpServer, agOptions);

let expressApp = express();
if (ENVIRONMENT === 'dev') {
  // Log every HTTP request. See https://github.com/expressjs/morgan for other
  // available formats.
  expressApp.use(morgan('dev'));
}
expressApp.use(express.static('uiapp/build'));
expressApp.use(express.static('public'));
expressApp.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
expressApp.use(bodyParser.json({limit:"50mb"})); //Used to parse JSON bodies

// Add GET /health-check express route
expressApp.get('/health-check', (_req, res) => {
  res.status(200).send('OK');
});

const METADATA_NETWORK_INTERFACE_URL =
  'http://metadata/computeMetadata/v1/' +
  '/instance/network-interfaces/0/access-configs/0/external-ip';

const getExternalIp = async () => {
  const options = {
    headers: {
      'Metadata-Flavor': 'Google',
    },
    json: true,
  };

  try {
    const {body} = await request(METADATA_NETWORK_INTERFACE_URL, options);
    return body;
  } catch (err) {
    console.log(`${cc.red('[Error]')} while talking to metadata server, assuming localhost ${err}`);
    return 'localhost';
  }
};

expressApp.get('/ping', async (_req, res) => {
  res.send('pong');
});

expressApp.get('/_info', async (req, res)=>{

  const baseUrl='http://metadata.google.internal/computeMetadata/v1/instance';
  const options = {
    headers: {
      'Metadata-Flavor': 'Google',
    },
    json: true,
  };
  let URL=`${baseUrl}/${req.query.p||''}`;
  try {
    const {body} = await request(URL, options);
    return res.json(body);
  } catch (err) {
    console.log(`${cc.red('[Error]')} while talking to metadata server, assuming localhost ${err}`);
    return res.json({error:`${URL} fetch error`, details:err});
  }
})

expressApp.use('/api', require('./api'));

let indexhtml;

expressApp.get('*', (_req, res)=>{
  if (!indexhtml) {
    indexhtml = fs.readFileSync('uiapp/build/index.html');
  }
  res.send(indexhtml.toString());
});

// HTTP request handling loop.
(async () => {
  for await (let requestData of httpServer.listener('request')) {
    expressApp.apply(null, requestData);
  }
})();

let active=0;
const socketMap={};
const userMap={};
const statusRef = admin.database().ref('/atmyplace_users');

statusRef.on('child_changed', function(snapshot){
  try {
    var newData = snapshot.val();
    console.log(`${cc.yellow(newData.state)}\t user: ${cc.blue(snapshot.key)}`);
    const docref=db().collection('atmyplace_users').doc(snapshot.key);

    docref.set({
      state: newData.state,
    }, {merge: true});
  } catch (e) {
    console.error(e);
  }
});

// SocketCluster/WebSocket connection handling loop.
(async () => {
  for await (let {socket} of agServer.listener('connection')) {
    // Handle socket connection.
    const LSOCKETID = cc.bright(socket.id);
    const log = (e,m)=>console.log(`   ${cc.dim(`[${e}]`)}\t${LSOCKETID} ${m||''}`);
    socketMap[socket.id]={
      socket,
      events:{}
    };
    log('New',`active:${Object.keys(socketMap).length}`);

    (async () => {
      for await (let event of socket.listener('raw')){
        console.dir(event.message);
      }
    })();

    (async () => {
      for await (let event of socket.listener('subscribe')){
        const data = event.subscriptionOptions.data;
        if (data.eid) {
          const sdata = socketMap[socket.id];
          sdata.uid=data.uid;
          sdata.events[data.eid]=data;
          socketMap[socket.id]=sdata;

          const udata=userMap[data.uid]||{};
          udata.socket = socket;
          userMap[data.uid] = udata;
          log('Joined',`user:${cc.blue(data.uid)} event:${cc.yellow(data.eid)}`);
        }
      }
    })();
    (async () => {
      for await (let event of socket.listener('unsubscribe')){
        const sdata = socketMap[socket.id];
        const edata=sdata.events[event.channel];
        log('Exited',`event:${cc.yellow(event.channel)} user:${cc.blue(edata.uid)}`);
        const usr =  db().collection('/atmyplace_events').doc(event.channel).collection('attendees').doc(edata.uid);
        usr.delete()
          .then(()=>{
            // removed from attendees
          })
          .catch(e=>{
            console.error(`Unable to remove attendee ${sdata.uid} `,e)
          })
        delete sdata.events[event.channel];
        socketMap[socket.id]=sdata;
      }
    })();


    (async () => {
      // Set up a loop to handle and respond to RPCs.
      for await (let request of socket.procedure('register')) {
        const data=request.data;
        if (data.uid) {
          const udata=userMap[data.uid]||{};
          udata.socket = socket;
          userMap[data.uid] = udata;

          const sdata = socketMap[socket.id];
          sdata.uid=data.uid;
          socketMap[socket.id]=sdata;
          log('register',`user:${cc.blue(data.uid)}`);
        }
        request.end('ok');
      }
    })();

    (async () => {
      // Set up a loop to handle and respond to RPCs.
      for await (let request of socket.procedure('sendDesc')) {
        const data=request.data;
        // if (request.data && request.data.bad) {
        //   let badCustomError = new Error('Server failed to execute the procedure');
        //   badCustomError.name = 'BadCustomError';
        //   request.error(badCustomError);
        //   continue;
        // }
        const sdata=socketMap[socket.id];
        const udata = userMap[data.uid];
        log('sdp', `to:${cc.blue(data.uid)} from:${cc.blue(sdata.uid)}`);
        if (udata) {
          udata.socket.invoke('gotDesc',{uid:sdata.uid, desc:data.desc})
            .then(d=>{
              request.end(d);
            })
            .catch(e=>{
              log('ERROR', cc.red(JSON.stringify(e)));
            })
        } else {
          let noUserError = new Error('Server failed to find user');
          noUserError.name = 'NoUserError';
          request.error(noUserError);
        }
      }
    })();

    (async () => {
      // Set up a loop to handle and respond to RPCs.
      for await (let request of socket.procedure('sendIceCandidate')) {
        const data=request.data;
        const sdata=socketMap[socket.id];
        const udata = userMap[data.uid];
        log('ice', `to:${cc.blue(data.uid)} from:${cc.blue(sdata.uid)}`);
        if (udata) {
          udata.socket.invoke('gotIceCandidate',{uid:sdata.uid, candidate:data.candidate})
            .then(d=>{
              request.end(d);
            })
            .catch(e=>{
              log('ERROR', cc.red(JSON.stringify(e)));
            })
        } else {
          let noUserError = new Error('Server failed to find user');
          noUserError.name = 'NoUserError';
          request.error(noUserError);
        }
      }
    })();  
    
    (async () => {
      for await (let event of socket.listener('close')){
        log('Close',`data: ${JSON.stringify(event)}`);
        setTimeout(()=>{
          const sdata = socketMap[socket.id];
          const udata = userMap[sdata.uid];
          if (udata && udata.socket===socket) {
            delete userMap[sdata.uid];
          }
          delete socketMap[socket.id];
          // socket.kickOut([channel, message])
          log('Cleanup',`user:${cc.blue(sdata.uid)} active:${Object.keys(socketMap).length}`);
        }, 10000)
      }
    })();
  }
})();

httpServer.listen(SOCKETCLUSTER_PORT);

if (SOCKETCLUSTER_LOG_LEVEL >= 1) {
  (async () => {
    for await (let {error} of agServer.listener('error')) {
      console.error(error);
    }
  })();
}

if (SOCKETCLUSTER_LOG_LEVEL >= 2) {
  console.log(
    `   ${colorText('[Active]', 32)} SocketCluster worker with PID ${process.pid} is listening on port ${SOCKETCLUSTER_PORT}`
  );

  (async () => {
    for await (let {warning} of agServer.listener('warning')) {
      console.warn(warning);
    }
  })();
}

function colorText(message, color) {
  if (color) {
    return `\x1b[${color}m${message}\x1b[0m`;
  }
  return message;
}

if (SCC_STATE_SERVER_HOST) {
  // Setup broker client to connect to SCC.
  let sccClient = sccBrokerClient.attach(agServer.brokerEngine, {
    instanceId: SCC_INSTANCE_ID,
    instancePort: SOCKETCLUSTER_PORT,
    instanceIp: SCC_INSTANCE_IP,
    instanceIpFamily: SCC_INSTANCE_IP_FAMILY,
    pubSubBatchDuration: SCC_PUB_SUB_BATCH_DURATION,
    stateServerHost: SCC_STATE_SERVER_HOST,
    stateServerPort: SCC_STATE_SERVER_PORT,
    mappingEngine: SCC_MAPPING_ENGINE,
    clientPoolSize: SCC_CLIENT_POOL_SIZE,
    authKey: SCC_AUTH_KEY,
    stateServerConnectTimeout: SCC_STATE_SERVER_CONNECT_TIMEOUT,
    stateServerAckTimeout: SCC_STATE_SERVER_ACK_TIMEOUT,
    stateServerReconnectRandomness: SCC_STATE_SERVER_RECONNECT_RANDOMNESS,
    brokerRetryDelay: SCC_BROKER_RETRY_DELAY
  });

  if (SOCKETCLUSTER_LOG_LEVEL >= 1) {
    (async () => {
      for await (let {error} of sccClient.listener('error')) {
        error.name = 'SCCError';
        console.error(error);
      }
    })();
  }
}
