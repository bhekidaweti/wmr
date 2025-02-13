import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAjijdurxgJo_0jwZE9LzGhlvg8NFXjvYg",
    authDomain: "wmr-memes.firebaseapp.com",
    projectId: "wmr-memes",
    storageBucket: "wmr-memes.firebasestorage.app",
    messagingSenderId: "466089997616",
    appId: "1:466089997616:web:2e649402eef3aa564f84f5",
    measurementId: "G-VRMHB3691B"
  };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
