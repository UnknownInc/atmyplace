import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://ind-si-infra-managment-184960.firebaseio.com",
});


export default admin;
export const auth = admin.auth;
export const db = admin.firestore; 

