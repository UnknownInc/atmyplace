import express from 'express';
import {db} from '../services/firebase.js';
import {requireAuth, requireUser} from '../services/auth.js';
const api = express.Router();

api.get('/:eventname', async (req, res)=>{
  try {
    const qRef = db().collection('/atmyplace_events')
        .where('name', '==', req.params.eventname.toLowerCase())
        .limit(1);

    let snapshots = await qRef.get();

    if (snapshots.empty) {
      return res.status(404).send();
    }

    return res.json({id:snapshots.docs[0].id, ...snapshots.docs[0].data()});

  } catch (e) {
    return res.status(500).send();
  }
});

api.put('/:eventid/join', requireUser, async (req, res)=>{
  try {
    const usr =  db().collection('/atmyplace_events').doc(req.params.eventid).collection('attendees').doc(req.uid);
    usr.set({
      displayName: req.user.displayName,
      photoURL: req.user.photoURL,
      lastJoinTime: db.FieldValue.serverTimestamp(),
      ...req.body
    },{merge: true});
    return res.json({});
  } catch (e) {
    console.trace(e);
    return res.status(500).send();
  }
})


api.get('/:eventid/attendees', requireUser, async (req, res)=>{
  try {
    const collectionRef =  db().collection('/atmyplace_events').doc(req.params.eventid).collection('attendees');
    
    const attendees=[];

    const documentRefs = await collectionRef.listDocuments();
    
    let i=0;
    while(i<documentRefs.length){
      const documentSnapshot = await documentRefs[i].get();
      attendees.push(documentSnapshot.data());
      i++;
    }
    return res.json(attendees);
  } catch (e) {
    console.trace(e);
    return res.status(500).send();
  }
})

api.get('/:eventid/exit', requireUser, async (req, res)=>{
  try {
    const usr =  db().collection('/atmyplace_events').doc(req.params.eventid).collection('attendees').doc(req.uid);
    await usr.delete();
    return res.json({});
  } catch (e) {
    return res.status(500).send();
  }
})

api.put('/', requireAuth, async (req, res)=>{
  const { name='', isPublic=false} = req.body;
  if (name.trim()==='') {
    return res.status(400).send({error:'Invalid value for name, name cannot be empty'});
  }
  if (name.length>64) {
    return res.status(400).send({error:'Invalid value for name, name length cannot be more than 64 characters'});
  }

  try {
    let docRef = db().collection('/atmyplace/events/sessions').doc();
    const wr = await docRef.create({
      name,
      ispublic,
      uid: req.uid,
      createdAt: new Date(new Date().toUTCString()),
      lastUpdatedAt: new Date(new Date().toUTCString()),
    })

    console.log(wr);

    return res.json(docRef.data())
  } catch (e) {
    console.error(e);
    return res.status(500).send({error: 'Server error creating an event.'})
  }
})

module.exports=api;
