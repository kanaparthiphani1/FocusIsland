import { StorageKeys, getLocal, setLocal } from '../utils/storage';

const FIREBASE_BASE = 'https://firestore.googleapis.com/v1/projects';

function projectPath() {
  return `${FIREBASE_BASE}/${import.meta.env.VITE_FIREBASE_PROJECT_ID}/databases/(default)/documents`;
}

async function patchDocument(path, fields, token) {
  const url = `${projectPath()}/${path}`;
  await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  });
}

function toMapValue(obj) {
  return {
    mapValue: {
      fields: Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, { integerValue: String(value) }])
      )
    }
  };
}

export async function syncToFirestore() {
  const { [StorageKeys.AUTH]: auth, [StorageKeys.TRACKING]: tracking = {}, [StorageKeys.SESSIONS]: sessions = [] } =
    await getLocal([StorageKeys.AUTH, StorageKeys.TRACKING, StorageKeys.SESSIONS]);
  if (!auth?.idToken || !auth?.uid) return false;

  const ops = Object.entries(tracking).map(([date, stats]) =>
    patchDocument(`users/${auth.uid}/siteUsage/${date}`, {
      date: { stringValue: date },
      byDomain: toMapValue(stats.byDomain || {}),
      byTab: toMapValue(stats.byTab || {})
    }, auth.idToken)
  );

  const latest = sessions.slice(-10);
  latest.forEach((session) => {
    ops.push(
      patchDocument(`users/${auth.uid}/sessions/${session.id}`, {
        taskId: { stringValue: session.taskId || 'unknown' },
        duration: { integerValue: String(session.duration || 0) },
        createdAt: { stringValue: session.createdAt }
      }, auth.idToken)
    );
  });

  await Promise.allSettled(ops);
  await setLocal({ lastSyncAt: new Date().toISOString() });
  return true;
}
