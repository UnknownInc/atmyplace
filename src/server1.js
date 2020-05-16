import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid'; // For version 5
const tempDirectory = require('temp-dir');
const SignalServer = require('./SignalServer');

const app = express();

/*
App Engine terminates the HTTPS connection at the load balancer and forwards the request to your application.
Some applications need to determine the original request IP and protocol. The user's IP address is available 
in the standard X-Forwarded-For header. Applications that require this information should configure their web 
framework to trust the proxy.
*/
app.set('trust proxy', true);

app.use(require('cors')());
app.use(morgan('common'))

app.use(express.static('uiapp/build',{}));
app.use(express.static('public',{}));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({limit:"50mb"})); //Used to parse JSON bodies


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
    console.log('Error while talking to metadata server, assuming localhost');
    return 'localhost';
  }
};

app.get('/ping', async (_req, res) => {
  res.send('pong');
});

app.use('/api', require('./api'));

app.get('*', (req, res)=>{
  res.redirect('/index.html')
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.info('rmthks listening on port', port);
  const signal = new SignalServer({ server });
  signal.connect(); 
});