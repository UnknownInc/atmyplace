import express from 'express';
import {db} from '../services/firebase.js';
import {requireAuth, requireUser} from '../services/auth.js';
import md5 from 'md5';
const api = express.Router();

api.get('/:uid', requireAuth, async (req, res) => {
  let uid=req.uid;
  if (req.uid!==req.params.uid) {
    if (req.params.uid.toLowerCase()!=='current') {
      return res.status(403).send();
    }
  }
  const docRef = db().collection('/atmyplace_users').doc(`${uid}`);

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

api.post('/:uid', requireAuth, async (req, res)=>{
  let uid=req.uid;
  if (req.uid!==req.params.uid) {
    if (req.params.uid!=='current') {
      return res.status(403).send();
    }
  }
  try {
    const docRef = db().collection('/atmyplace_users').doc(`${uid}`);

    //let snapshot = await docRef.get();

    const updates={};

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

    const snapshot = await docRef.get();

    return res.json(snapshot.data());
  } catch (e) {
    console.error(e);
    return res.status(500).send({});
  }

})

module.exports=api;