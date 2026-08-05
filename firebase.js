// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSdC81UW_9uUSgVZNYWlRdeAOomqpD5q4",
  authDomain: "asodeco-emprendimientos.firebaseapp.com",
  projectId: "asodeco-emprendimientos",
  storageBucket: "asodeco-emprendimientos.firebasestorage.app",
  messagingSenderId: "1091701344854",
  appId: "1:1091701344854:web:d16bd06fab57e9fd8009f7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();