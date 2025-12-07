import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAJQ8IgAM-FJtVNFnXpfpRy545r0i30MfY",
  authDomain: "push-notification-380ed.firebaseapp.com",
  projectId: "push-notification-380ed",
  storageBucket: "push-notification-380ed.firebasestorage.app",
  messagingSenderId: "401283492098",
  appId: "1:401283492098:web:7699f4839a400ee7d3fa1b",
  measurementId: "G-TJ5PNRSMWG"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export const fetchToken = async () => {
  try {
    const fcmMessaging = await messaging();
    if (fcmMessaging) {
      const token = await getToken(fcmMessaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
      });
      return token;
    }
    return null;
  } catch (err) {
    console.error("An error occurred while fetching the token:", err);
    return null;
  }
};

export { app, messaging };
