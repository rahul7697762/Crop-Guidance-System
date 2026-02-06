import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCOB8aJrAmDhRnCfC7IAG83oq1dQqOBhfM",
    authDomain: "cropwise-9e7af.firebaseapp.com",
    projectId: "cropwise-9e7af",
    storageBucket: "cropwise-9e7af.firebasestorage.app",
    messagingSenderId: "962288835562",
    appId: "1:962288835562:web:680a0a436180114410b093",
    measurementId: "G-X0FPT2JMES"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;