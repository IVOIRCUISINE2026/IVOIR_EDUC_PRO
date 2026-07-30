import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    // Only log if it's NOT a user cancellation or popup block
    if (
      error.code !== 'auth/popup-closed-by-user' && 
      error.code !== 'auth/cancelled-popup-request' &&
      error.code !== 'auth/popup-blocked'
    ) {
      console.error("Error signing in with Google:", error);
    }
    throw error;
  }
};

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string | null;
    email: string | null;
    emailVerified: boolean;
    isAnonymous: boolean;
  }
}

export const handleFirestoreError = (error: any, operation: FirestoreErrorInfo['operationType'], path: string | null = null) => {
  const info: FirestoreErrorInfo = {
    error: error.message || String(error),
    operationType: operation,
    path: path,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || false,
    }
  };
  
  if (error.code === 'permission-denied') {
    console.error("SECURE_ACCESS_DENIED:", JSON.stringify(info));
    return "ACCÈS REFUSÉ : Vous n'avez pas les permissions nécessaires. Veuillez vous connecter avec le compte administrateur.";
  }
  
  return "Une erreur de base de données est survenue.";
};
