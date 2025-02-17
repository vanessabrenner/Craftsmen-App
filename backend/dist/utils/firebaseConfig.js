"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.app = void 0;
// Import the functions you need from the SDKs you need
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCSQbRkywhaCR7ssBf_U5KnJ75ppIboOA0",
    authDomain: "meseriasii-91b95.firebaseapp.com",
    projectId: "meseriasii-91b95",
    storageBucket: "meseriasii-91b95.firebasestorage.app",
    messagingSenderId: "303207656883",
    appId: "1:303207656883:web:96b682b6f8c3265d906fc6",
    measurementId: "G-XK8KD5N0XQ",
};
// Initialize Firebase
const app = (0, app_1.initializeApp)(firebaseConfig);
exports.app = app;
const db = (0, firestore_1.getFirestore)(app);
exports.db = db;
