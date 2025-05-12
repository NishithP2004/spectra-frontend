import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDFVZHOVbECqvTpLLldcghzYTsdBtIzLfU",
  authDomain: "spectra-458420.firebaseapp.com",
  projectId: "spectra-458420",
  storageBucket: "spectra-458420.firebasestorage.app",
  messagingSenderId: "347270170483",
  appId: "1:347270170483:web:5b4393d2d1588a73c8e706",
  measurementId: "G-TMG4FJWCZM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);