import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/main.css';
import { loginWithEmail, loginWithGoogle, registerWithEmail } from '../firebase/firebaseAuth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const notifyBackground = async (user) => {
    const token = await user.getIdToken();
    await chrome.runtime.sendMessage({
      type: 'AUTH_UPDATE',
      payload: { uid: user.uid, email: user.email, idToken: token }
    });
    window.location.href = '../popup/popup.html';
  };

  const withHandler = (fn) => async () => {
    try {
      setError('');
      const result = await fn(email, password);
      await notifyBackground(result.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <section className="card w-full max-w-md space-y-3">
        <h1 className="text-2xl font-bold">Login to FocusIsland</h1>
        <input className="w-full bg-slate-800 p-2 rounded" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full bg-slate-800 p-2 rounded" placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
        <div className="flex gap-2">
          <button className="bg-emerald-500 text-black px-3 py-2 rounded" onClick={withHandler(loginWithEmail)}>Sign in</button>
          <button className="bg-cyan-500 text-black px-3 py-2 rounded" onClick={withHandler(registerWithEmail)}>Register</button>
        </div>
        <button className="border border-slate-600 px-3 py-2 rounded" onClick={async () => notifyBackground((await loginWithGoogle()).user)}>Continue with Google</button>
        {error && <p className="text-rose-400 text-sm">{error}</p>}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<Login />);
