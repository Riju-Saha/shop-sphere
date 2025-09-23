'use client';

import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, DatabaseReference, query, orderByChild, equalTo, get } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

interface UserData {
  name: string;
  username: string;
  email: string;
  userType: 'buyer' | 'seller';
  password: string;
  createdAt: Date;
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export const registerUserToDb = async (userData: UserData) => {
  try {
    let userRef: DatabaseReference;

    if (userData.userType === 'buyer') {
      userRef = ref(db, 'buyers');
    } else {
      userRef = ref(db, 'sellers');
    }

    const newEntryRef = await push(userRef, userData);
    console.log("Data added with key: ", newEntryRef.key);
    return newEntryRef;
  } catch (e) {
    console.error("Error adding data: ", e);
    throw new Error("Failed to register user to database.");
  }
};

export const loginUserFromDb = async (email: string, password: string, userType: 'buyer' | 'seller') => {
  try {
    let userRef: DatabaseReference;

    if (userType === 'buyer') {
      userRef = ref(db, 'buyers');
    } else {
      userRef = ref(db, 'sellers');
    }

    const userQuery = query(userRef, orderByChild('email'), equalTo(email));

    const snapshot = await get(userQuery);

    if (snapshot.exists()) {
      let userData = null;
      snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.val();
        if (user.password === password) {
          userData = user;
        }
      });
      if (userData) {
        console.log("User logged in:", userData);
        return userData;
      }
    }

    throw new Error("Invalid email or password.");
  } catch (error: any) {
    console.error("Login failed:", error);
    const errorMessage = error.message || "An unknown error occurred.";
    throw new Error(errorMessage);
  }
};