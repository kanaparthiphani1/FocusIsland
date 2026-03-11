import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import { StorageKeys, setLocal } from '../utils/storage';

export function subscribeAuthState(callback) {
  return onAuthStateChanged(auth, async (user) => {
    await setLocal({
      [StorageKeys.AUTH]: user
        ? { uid: user.uid, email: user.email, displayName: user.displayName }
        : null
    });
    callback(user);
  });
}

export function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function registerWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}
