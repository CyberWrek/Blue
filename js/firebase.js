// firebase-init.js
// This file sets up Firebase v8 with global firebase object

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyDIeXlWEwB0M-uofdafELFw9Qloedv0rJA",
  authDomain: "blue-app-ee9c4.firebaseapp.com",
  projectId: "blue-app-ee9c4",
  storageBucket: "blue-app-ee9c4.appspot.com",
  messagingSenderId: "418321613823",
  appId: "1:418321613823:web:42bb58be4c62082cbcddca"
};

// Initialize Firebase (if not already initialized)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Attach db and auth to window (global)
window.db = firebase.firestore();
window.auth = firebase.auth();
