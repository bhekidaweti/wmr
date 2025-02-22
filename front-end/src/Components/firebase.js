import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

console.log("API Key from ENV:", process.env.REACT_APP_FIREBASE_API_KEY);
console.log("Auth Domain from ENV:", process.env.REACT_APP_FIREBASE_AUTH_DOMAIN);


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY ,//|| "AIzaSyAjijdurxgJo_0jwZE9LzGhlvg8NFXjvYg",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ,//|| "wmr-memes.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, onAuthStateChanged };
