import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/main.css';
import { StorageKeys } from '../utils/storage';

function Settings() {
  const [allowList, setAllowList] = useState('leetcode.com,github.com,chat.openai.com');
  useEffect(() => {
    chrome.storage.local.get([StorageKeys.SETTINGS], (res) => {
      const arr = res[StorageKeys.SETTINGS]?.allowList || [];
      if (arr.length) setAllowList(arr.join(','));
    });
  }, []);
  const save = async () => {
    await chrome.storage.local.set({ [StorageKeys.SETTINGS]: { allowList: allowList.split(',').map((x) => x.trim()).filter(Boolean) } });
  };
  return <main className="p-6"><section className="card"><h1 className="text-xl font-bold mb-2">Settings</h1><textarea className="w-full bg-slate-800 rounded p-2" rows="4" value={allowList} onChange={(e)=>setAllowList(e.target.value)} /><button className="mt-3 bg-emerald-500 text-black px-3 py-2 rounded" onClick={save}>Save allow list</button></section></main>;
}
createRoot(document.getElementById('root')).render(<Settings />);
