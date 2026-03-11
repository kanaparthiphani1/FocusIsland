import { initTabTracker, flushTrackedTime } from './tabTracker';
import { startPomodoro, pausePomodoro, resumePomodoro, resetPomodoro, tickPomodoro } from './pomodoroEngine';
import { applyFocusBlocking, clearFocusBlocking } from './blocker';
import { syncToFirestore } from './firebaseSync';
import { StorageKeys, getLocal, setLocal, updateLocal } from '../utils/storage';

const SYNC_ALARM = 'focusIslandSync';
const FLUSH_ALARM = 'focusIslandFlush';
const DEFAULT_ALLOW = ['leetcode.com', 'github.com', 'chat.openai.com'];

initTabTracker();
chrome.alarms.create(SYNC_ALARM, { periodInMinutes: 5 });
chrome.alarms.create(FLUSH_ALARM, { periodInMinutes: 0.5 });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    switch (message.type) {
      case 'POMODORO_START':
        await startPomodoro(message.task);
        await applyFocusBlocking(message.allowList?.length ? message.allowList : DEFAULT_ALLOW);
        sendResponse({ ok: true });
        break;
      case 'POMODORO_PAUSE':
        await pausePomodoro();
        sendResponse({ ok: true });
        break;
      case 'POMODORO_RESUME':
        await resumePomodoro();
        sendResponse({ ok: true });
        break;
      case 'POMODORO_RESET':
        await resetPomodoro();
        await clearFocusBlocking();
        sendResponse({ ok: true });
        break;
      case 'AUTH_UPDATE':
        await setLocal({ [StorageKeys.AUTH]: message.payload });
        sendResponse({ ok: true });
        break;
      default:
        sendResponse({ ok: false });
    }
  })();
  return true;
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'focusIslandPomodoroTick') {
    const result = await tickPomodoro();
    if (result?.done) {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'assets/icons/icon48.png',
        title: 'FocusIsland',
        message: `Phase changed: ${result.state.phase}`
      });
      await chrome.runtime.sendMessage({ type: 'POMODORO_TICK', payload: result.state }).catch(() => null);
    }
    return;
  }
  if (alarm.name === SYNC_ALARM) {
    await syncToFirestore();
    return;
  }
  if (alarm.name === FLUSH_ALARM) {
    await flushTrackedTime();
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  await updateLocal(StorageKeys.SETTINGS, (value = {}) => ({
    allowList: DEFAULT_ALLOW,
    darkMode: true,
    ...value
  }));
  const { [StorageKeys.AUTH]: auth } = await getLocal([StorageKeys.AUTH]);
  if (!auth) chrome.tabs.create({ url: chrome.runtime.getURL('auth/login.html') });
});
