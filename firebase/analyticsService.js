import { logEvent } from 'firebase/analytics';
import { getFirebaseAnalytics } from './firebaseConfig';

export async function trackEvent(eventName, params = {}) {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) return;
  logEvent(analytics, eventName, params);
}
