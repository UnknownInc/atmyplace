import express from 'express';
import {signin} from '../services/auth.js';

const api = express.Router();

api.post('/signin', async (req, res)=>{
  try {
    const {email, password} = req.body;
    var uc = await signin(email, password);
    return res.json(uc.user);
  } catch (e) {
    console.error(e);
    return res.status(400).json({error:'Bad username or password'});
  }
});

api.get('/profile', function (req, res){
  console.debug(req.path);
  return res.json({
    uid: 'agsfh4654',
    name: 'Full Name',
    email: 'someone@email.com',

  })
})

module.exports=api;