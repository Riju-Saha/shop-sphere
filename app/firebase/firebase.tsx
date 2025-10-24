'use client';

import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, DatabaseReference, query, orderByChild, equalTo, get, set, remove } from "firebase/database";

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

interface ProductData {
  username: string;
  productCategory: string;
  productSubCategory: string;
  productName: string;
  productPrice: string;
  createdAt: Date;
}

interface CartItemData {
  buyerUsername: string;
  productKey: string;
  sellerUsername: string;
  productPrice: number;
  productQuantity: number;
  productName: string;
}

export interface DBCartItem {
  productKey: string;
  productName: string;
  productQuantity: number;
  sellerUsername: string;
  priceAtAddition: number;
  updatedAt?: string;
}

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
    console.log("new entry ref is ", newEntryRef)
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
      let userEmail = null;
      snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.val();
        if (user.password === password) {
          userData = user;
          userEmail = user.email;
        }
      });
      if (userData && userEmail) {
        console.log("User logged in:", userData);
        return userData;
      }
    }

    // throw new Error("Invalid email or password.");
    return null;
  } catch (error: any) {
    console.error("Login failed:", error);
    const errorMessage = error.message || "An unknown error occurred.";
    // throw new Error(errorMessage);
    return null;
  }
};

export const addProductToDb = async (productData: ProductData) => {
  console.log("data i got", productData)
  try {
    let productRef: DatabaseReference;

    productRef = ref(db, 'products');
    console.log("procuct ref", productRef);

    const newEntryRef = await push(productRef, productData);
    console.log("new entry ref", newEntryRef);
    console.log("Product added with key: ", newEntryRef.key);

    return newEntryRef;
  } catch (e) {
    console.error("Error adding product: ", e);
    throw new Error("Failed to register product to database.");
  }
}

export const getSellerProducts = async (username: string, category: string, subCategory: string) => {
  try {
    const productsRef = ref(db, 'products');

    let productQuery = query(productsRef, orderByChild('username'), equalTo(username));

    const snapshot = await get(productQuery);

    if (snapshot.exists()) {
      const allProducts: any[] = [];
      snapshot.forEach((childSnapshot) => {
        const product = childSnapshot.val();

        if (
          product.productCategory === category &&
          product.productSubCategory === subCategory
        ) {
          allProducts.push({ key: childSnapshot.key, ...product });
        }
      });
      console.log(`Found ${allProducts.length} products.`);
      return allProducts;
    }

    return [];
  } catch (e) {
    console.error("Error fetching seller products: ", e);
    return [];
  }
};

export const getBuyerProducts = async (category: string, subCategory: string) => {
  try {
    const productsRef = ref(db, 'products');

    const productQuery = query(
      productsRef,
      orderByChild('productCategory'),
      equalTo(category)
    );

    const snapshot = await get(productQuery);

    if (snapshot.exists()) {
      const allProducts: any[] = [];

      snapshot.forEach((childSnapshot) => {
        const product = childSnapshot.val();

        if (product.productSubCategory === subCategory) {
          allProducts.push({ key: childSnapshot.key, ...product });
        }
      });

      console.log(`Found ${allProducts.length} products across all sellers.`);
      return allProducts;
    }

    return [];
  } catch (e) {
    console.error("Error fetching buyer products: ", e);
    return [];
  }
};

export const addToCartDb = async (itemData: CartItemData) => {
  const cartItemRef = ref(db, `carts/${itemData.buyerUsername}/${itemData.productKey}`);

  try {
    await set(cartItemRef, {
      productKey: itemData.productKey,
      productQuantity: itemData.productQuantity,
      sellerUsername: itemData.sellerUsername,
      priceAtAddition: itemData.productPrice,
      productName: itemData.productName,
    });
    console.log(`Product ${itemData.productKey} added to cart for user: ${itemData.buyerUsername}`);
    return true;
  } catch (e) {
    console.error("Error adding product to cart: ", e);
    throw new Error("Failed to add item to cart.");
  }
};

export const updateCartItemQuantityDb = async (
  buyerUsername: string,
  productKey: string,
  newQuantity: number,
  priceAtAddition: number,
  sellerUsername: string,
  productName: string
) => {
  const cartItemRef = ref(db, `carts/${buyerUsername}/${productKey}`);

  try {
    await set(cartItemRef, {
      productKey,
      productQuantity: newQuantity,
      sellerUsername,
      productName,
      priceAtAddition,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (e) {
    console.error("Error updating cart quantity:", e);
    throw new Error("Failed to update cart quantity.");
  }
};

export const removeCartItemDb = async (buyerUsername: string, productKey: string) => {
  const cartItemRef = ref(db, `carts/${buyerUsername}/${productKey}`);

  try {
    await remove(cartItemRef);
    console.log(`Product ${productKey} removed from cart for user: ${buyerUsername}`);
    return true;
  } catch (e) {
    console.error("Error removing cart item:", e);
    throw new Error("Failed to remove item from cart.");
  }
};

export const getCartItemsDb = async (buyerUsername: string): Promise<DBCartItem[]> => {
  if (!buyerUsername || buyerUsername === 'Guest') {
    return [];
  }
  
  const cartRef = ref(db, `carts/${buyerUsername}`);

  try {
    const snapshot = await get(cartRef);

    if (snapshot.exists()) {
      const cartItems: DBCartItem[] = [];
      
      snapshot.forEach((childSnapshot) => {
        const item = childSnapshot.val();
        cartItems.push({ 
          productKey: childSnapshot.key as string, 
          ...item 
        });
      });

      console.log(`Found ${cartItems.length} cart items for user: ${buyerUsername}`);
      return cartItems;
    }

    return [];
  } catch (e) {
    console.error("Error fetching cart items: ", e);
    throw new Error("Failed to fetch cart items.");
  }
};