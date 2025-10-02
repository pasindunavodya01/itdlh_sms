// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAUbuwB8BJk5_97WuXn_ZFWoM5ZiamoV98",
  authDomain: "sms-itdlh.firebaseapp.com",
  projectId: "sms-itdlh",
  storageBucket: "sms-itdlh.appspot.com",
  messagingSenderId: "27418165275",
  appId: "1:27418165275:web:7be48a6c4d69be7c28f8be",
  measurementId: "G-RG19Z8VPH6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);