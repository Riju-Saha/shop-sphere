'use client';

import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, DatabaseReference, query, orderByChild, equalTo, get } from "firebase/database";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
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

interface ProductData {
  username: string;
  productCategory: string;
  productSubCategory: string;
  productName: string;
  productPrice: string;
  createdAt: Date;
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

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

export const loginUserFromDb = async (username: string, password: string, userType: 'buyer' | 'seller') => {
  try {
    let userRef: DatabaseReference;
    if (userType === 'buyer') {
      userRef = ref(db, 'buyers');
    } else {
      userRef = ref(db, 'sellers');
    }
    const userQuery = query(userRef, orderByChild('username'), equalTo(username));
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
    return null;
  } catch (error: any) {
    console.error("Login failed:", error);
    const errorMessage = error.message || "An unknown error occurred.";
    return null;
  }

};

export const addProductToDb = async (productData: ProductData) => {
  console.log("data i got", productData)
  try {
    let productRef: DatabaseReference;

    productRef = ref(db, 'products');
    console.log("procuct ref", productRef)

    const newEntryRef = await push(productRef, productData)
    console.log("new entry ref", newEntryRef)
    // console.log("Product added with key: ", newEntryRef.key);
    return newEntryRef;
  } catch (e) {
    console.error("Error adding product: ", e);
    throw new Error("Failed to register product to database.");
  }
};