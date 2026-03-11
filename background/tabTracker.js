import { StorageKeys, updateLocal } from '../utils/storage';
import { todayKey } from '../utils/timeUtils';

let current = { tabId: null, domain: null, startTs: null };

function extractDomain(url = '') {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

async function recordElapsed(now = Date.now()) {
  if (!current.startTs || !current.domain) return;
  const delta = Math.max(0, Math.floor((now - current.startTs) / 1000));
  const dateKey = todayKey(new Date(now));
  await updateLocal(StorageKeys.TRACKING, (data = {}) => {
    const dateStats = data[dateKey] || { byDomain: {}, byTab: {} };
    dateStats.byDomain[current.domain] = (dateStats.byDomain[current.domain] || 0) + delta;
    dateStats.byTab[current.tabId] = (dateStats.byTab[current.tabId] || 0) + delta;
    return { ...data, [dateKey]: dateStats };
  });
}

async function switchToTab(tabId) {
  const now = Date.now();
  await recordElapsed(now);
  if (!tabId) {
    current = { tabId: null, domain: null, startTs: null };
    return;
  }
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (!tab?.active || !tab.url) {
    current = { tabId: null, domain: null, startTs: null };
    return;
  }
  current = { tabId, domain: extractDomain(tab.url), startTs: now };
}

export function initTabTracker() {
  chrome.tabs.onActivated.addListener(({ tabId }) => switchToTab(tabId));
  chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    if (info.status === 'complete' && tab.active) switchToTab(tabId);
  });
  chrome.windows.onFocusChanged.addListener(async (windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      await switchToTab(null);
      return;
    }
    const [tab] = await chrome.tabs.query({ active: true, windowId });
    await switchToTab(tab?.id || null);
  });
  chrome.idle.onStateChanged.addListener(async (state) => {
    if (state !== 'active') await switchToTab(null);
  });
}

export async function flushTrackedTime() {
  await recordElapsed(Date.now());
}
