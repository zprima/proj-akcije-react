import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import { secrets } from "./secrets.js";

export const config = secrets.firebase;

firebase.initializeApp(config);

export const uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      return false;
    },
    uiShown: function() {}
  },
  signInFlow: "popup",
  signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID]
};

export const db = firebase.firestore();
const settings = { timestampsInSnapshots: true };
db.settings(settings);

export const userCollection = db.collection("users");
export const akcijeCollection = db.collection("akcije");
