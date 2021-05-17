import firebase from "firebase";
import "firebase/auth";
import * as admin from "firebase-admin";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_WEB_API_KEY,
  authDomain: process.env.FIREBASE_WEB_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_WEB_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_WEB_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_WEB_APP_ID,
  measurementId: process.env.FIREBASE_WEB_MEASUREMENT_ID
};
firebase.initializeApp(firebaseConfig);

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

export {
  firebase,
  admin
};