import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://ind-si-infra-managment-184960.firebaseio.com",
});


export const auth = admin.auth;
export const db = admin.firestore; 

const statusRef = admin.database().ref('/atmyplace_users');

statusRef.on('child_changed', function(snapshot){
  var newData = snapshot.val();
  console.log(`The user is ${snapshot.key} is ${newData.state}`);
  const docref=db().collection('atmyplace_users').doc(snapshot.key);

  docref.set({
    state: newData.state,
  }, {merge: true})
})
