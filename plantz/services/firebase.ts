// Firebase initialization
// Fill these with your Firebase project values from the Firebase console
// Project Settings -> General -> Your apps -> SDK setup & configuration

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBatWSI_fTOvL_pYbhQyOAch8jz6meiLzw',
  authDomain: 'plant-care-reminder-9f5a5.firebaseapp.com',
  projectId: 'plant-care-reminder-9f5a5',
  storageBucket: 'plant-care-reminder-9f5a5.firebasestorage.app',
  messagingSenderId: '377869529233',
  appId: '1:377869529233:web:4346e9896b524234b6cf30',
  measurementId: 'G-F8EWEBS6TG',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
