export const StorageKeys = {
  TRACKING: 'trackingData',
  POMODORO: 'pomodoroState',
  TASKS: 'tasks',
  SESSIONS: 'sessions',
  SETTINGS: 'settings',
  AUTH: 'authUser'
};

export function getLocal(keys) {
  return chrome.storage.local.get(keys);
}

export function setLocal(payload) {
  return chrome.storage.local.set(payload);
}

export async function updateLocal(key, updater) {
  const current = await getLocal([key]);
  const nextValue = updater(current[key]);
  await setLocal({ [key]: nextValue });
  return nextValue;
}
