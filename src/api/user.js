import express from 'express';
import {db} from '../services/firebase.js';
import {requireAuth} from '../services/auth.js';
import md5 from 'md5';
const api = express.Router();

api.get('/profile', requireAuth, async (req, res) => {

  const docRef = db.collection('/atmyplace/users/profile').doc(`${req.uid}`);

  let snapshot = await docRef.get();
  if (!snapshot.exists) {
    await docRef.set({
      uid: req.uid,
      email: req.auser.email||'',
      displayName: req.auser.displayName||'',
      photoURL: req.auser.photoURL|| `https://www.gravatar.com/avatar/${md5(req.auser.email)}`
    },{});
    snapshot = await docRef.get();
  }
  
  return res.json( snapshot.data());
})

api.post('/profile', requireAuth, async (req, res)=>{
  try {
    const docRef = db.collection('/atmyplace/users/profile').doc(`${req.uid}`);

    let snapshot = await docRef.get();

    const updates={};

    console.log(req.body);

    if (req.body.displayName) {
      updates.displayName = req.body.displayName.trim();
    }

    if (req.body.photoURL) {
      updates.photoURL = req.body.photoURL.trim();
    }

    if (req.body.shortDescription) {
      updates.shortDescription = req.body.shortDescription.trim();
    }

    await docRef.update(updates);

    snapshot = await docRef.get();

    return res.json(snapshot.data());
  } catch (e) {
    console.error(e);
    return res.status(500).send({});
  }

})

module.exports=api;