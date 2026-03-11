import { collection, doc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebaseConfig';

export async function upsertUserDocument(uid, path, id, data) {
  const ref = doc(db, 'users', uid, path, id);
  await setDoc(ref, data, { merge: true });
}

export async function batchSync(uid, payload) {
  const batch = writeBatch(db);
  Object.entries(payload).forEach(([path, docs]) => {
    docs.forEach(({ id, data }) => {
      const ref = doc(db, 'users', uid, path, id);
      batch.set(ref, data, { merge: true });
    });
  });
  await batch.commit();
}

export async function fetchCollection(uid, path) {
  const snap = await getDocs(collection(db, 'users', uid, path));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
}
