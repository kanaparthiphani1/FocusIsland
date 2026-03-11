import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/main.css';
import './popup.css';
import { StorageKeys } from '../utils/storage';
import { trackEvent } from '../firebase/analyticsService';

function PopupApp() {
  const [tasks, setTasks] = useState([]);
  const [pomodoro, setPomodoro] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', focusDuration: 25, breakDuration: 5, cycles: 4 });

  useEffect(() => {
    chrome.storage.local.get([StorageKeys.TASKS, StorageKeys.POMODORO], (res) => {
      setTasks(res[StorageKeys.TASKS] || []);
      setPomodoro(res[StorageKeys.POMODORO] || null);
    });
  }, []);

  const saveTask = async () => {
    const task = { ...form, id: crypto.randomUUID() };
    const next = [...tasks, task];
    await chrome.storage.local.set({ [StorageKeys.TASKS]: next });
    await trackEvent('task_created', { task_id: task.id });
    setTasks(next);
  };

  const send = async (type, payload = {}) => {
    await chrome.runtime.sendMessage({ type, ...payload });
    if (type === 'POMODORO_START') await trackEvent('focus_session_started');
  };

  return (
    <main className="p-4 space-y-3 w-[380px]">
      <section className="card">
        <h1 className="text-xl font-semibold">FocusIsland</h1>
        <p className="text-sm text-slate-400">Track focus and run Pomodoro cycles.</p>
      </section>
      <section className="card space-y-2">
        <h2 className="font-medium">Task Manager</h2>
        <input className="w-full bg-slate-800 rounded p-2" placeholder="Task title" onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="w-full bg-slate-800 rounded p-2" placeholder="Description" onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="grid grid-cols-3 gap-2 text-sm">
          <input className="bg-slate-800 rounded p-2" type="number" value={form.focusDuration} onChange={(e) => setForm({ ...form, focusDuration: Number(e.target.value) })} />
          <input className="bg-slate-800 rounded p-2" type="number" value={form.breakDuration} onChange={(e) => setForm({ ...form, breakDuration: Number(e.target.value) })} />
          <input className="bg-slate-800 rounded p-2" type="number" value={form.cycles} onChange={(e) => setForm({ ...form, cycles: Number(e.target.value) })} />
        </div>
        <button className="bg-emerald-500 text-black rounded px-3 py-2" onClick={saveTask}>Save Task</button>
      </section>
      <section className="card space-y-2">
        <h2 className="font-medium">Pomodoro Controls</h2>
        <div className="flex gap-2 flex-wrap">
          <button className="bg-emerald-500 text-black rounded px-3 py-2" onClick={() => send('POMODORO_START', { task: tasks[0] || form })}>Start</button>
          <button className="bg-amber-400 text-black rounded px-3 py-2" onClick={() => send('POMODORO_PAUSE')}>Pause</button>
          <button className="bg-cyan-400 text-black rounded px-3 py-2" onClick={() => send('POMODORO_RESUME')}>Resume</button>
          <button className="bg-rose-500 text-white rounded px-3 py-2" onClick={() => send('POMODORO_RESET')}>Reset</button>
        </div>
        <div className="timer-chip rounded-xl p-3 text-black font-semibold">
          {pomodoro ? `${pomodoro.phase} • ${Math.floor(pomodoro.remaining / 60)}:${String(pomodoro.remaining % 60).padStart(2, '0')}` : 'No active timer'}
        </div>
      </section>
      <div className="flex gap-3 text-sm">
        <a className="text-emerald-300" href="../dashboard/dashboard.html" target="_blank" rel="noreferrer">Open Analytics Dashboard</a>
        <a className="text-cyan-300" href="../settings/settings.html" target="_blank" rel="noreferrer">Settings</a>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<PopupApp />);
