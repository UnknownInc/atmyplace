import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
const config = {
  apiKey: "AIzaSyBZkzvBEFrYdg7PW2Fd7ymI65qROPz1Ny8",
  authDomain: "ind-si-infra-managment-184960.firebaseapp.com",
  databaseURL: "https://ind-si-infra-managment-184960.firebaseio.com",
  projectId: "ind-si-infra-managment-184960",
  storageBucket: "ind-si-infra-managment-184960.appspot.com",
  messagingSenderId: "149667563229",
  appId: "1:149667563229:web:1d7d2690446b65d4197d34"
};

firebase.initializeApp(config);

export const auth = firebase.auth;
export const db = firebase.database();