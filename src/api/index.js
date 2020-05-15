import express from 'express';

const apiroutes = express.Router();
apiroutes.use('/user', require('./user.js'));
apiroutes.use('/event', require('./event.js'));

module.exports=apiroutes;