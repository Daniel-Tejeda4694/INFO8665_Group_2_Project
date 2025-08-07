// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA581T3FKLNl--dtKjtuaajrJOiceYsaYQ",
  authDomain: "parla-1347c.firebaseapp.com",
  projectId: "parla-1347c",
  storageBucket: "parla-1347c.firebasestorage.app",
  messagingSenderId: "802557382070",
  appId: "1:802557382070:web:ea3f932b67bbf8f539c517",
  measurementId: "G-M9GVES2B2J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };