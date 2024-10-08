// firebaseConfig.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBHyI-52LIsvfdDiyNdcggsUGkbRwcbJhk",
  authDomain: "banking-management-syste-72242.firebaseapp.com",
  projectId: "banking-management-syste-72242",
  storageBucket: "gs://banking-management-syste-72242.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
