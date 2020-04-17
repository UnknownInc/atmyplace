import express from 'express';

const apiroutes = express.Router();
apiroutes.use('/user', require('./user.js'));

module.exports=apiroutes;