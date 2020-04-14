import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid'; // For version 5
const tempDirectory = require('temp-dir');
const SignalServer = require('./SignalServer');

const app = express();

app.use(require('cors')());
app.use(morgan('common'))

app.use(express.static('uiapp/build',{}));
app.use(express.static('public',{}));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({limit:"50mb"})); //Used to parse JSON bodies


app.get('/ping', async (_req, res) => {
  res.send('pong');
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.info('rmthks listening on port', port);
  const signal = new SignalServer({ server });
  signal.connect(); 
});