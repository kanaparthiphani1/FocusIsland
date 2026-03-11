import React, { useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import Chart from 'chart.js/auto';
import '../styles/main.css';
import { StorageKeys } from '../utils/storage';
import { todayKey } from '../utils/timeUtils';

function Dashboard() {
  const [data, setData] = React.useState({});

  useEffect(() => {
    chrome.storage.local.get([StorageKeys.TRACKING, StorageKeys.SESSIONS], (res) => {
      setData({
        tracking: res[StorageKeys.TRACKING] || {},
        sessions: res[StorageKeys.SESSIONS] || []
      });
    });
  }, []);

  const today = useMemo(() => data.tracking?.[todayKey()] || { byDomain: {} }, [data]);

  useEffect(() => {
    const byDomain = today.byDomain || {};
    const labels = Object.keys(byDomain);
    const values = Object.values(byDomain);
    const bar = new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Seconds per site', data: values, backgroundColor: '#34d399' }] }
    });
    const line = new Chart(document.getElementById('lineChart'), {
      type: 'line',
      data: {
        labels: data.sessions.map((s) => s.createdAt?.slice(11, 16)),
        datasets: [{ label: 'Focus sessions', data: data.sessions.map((s) => s.duration), borderColor: '#60a5fa' }]
      }
    });
    const productive = values.reduce((acc, n) => acc + n, 0);
    const distraction = Math.max(0, 8 * 3600 - productive);
    const pie = new Chart(document.getElementById('pieChart'), {
      type: 'pie',
      data: { labels: ['Productive', 'Distraction'], datasets: [{ data: [productive, distraction], backgroundColor: ['#10b981', '#f43f5e'] }] }
    });

    return () => [bar, line, pie].forEach((c) => c.destroy());
  }, [today, data.sessions]);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Productivity Analytics</h1>
      <section className="grid grid-cols-2 gap-3">
        <article className="card"><canvas id="barChart" /></article>
        <article className="card"><canvas id="lineChart" /></article>
        <article className="card col-span-2"><canvas id="pieChart" /></article>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<Dashboard />);
