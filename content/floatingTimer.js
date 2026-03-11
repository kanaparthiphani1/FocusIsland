const ID = 'focus-island-floating-timer';

function render(state) {
  let root = document.getElementById(ID);
  if (!root) {
    root = document.createElement('div');
    root.id = ID;
    root.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(17, 24, 39, 0.9);
      color: #fff;
      border-radius: 999px;
      padding: 10px 16px;
      font: 13px/1.3 -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif;
      z-index: 2147483647;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      display:none;
    `;
    root.addEventListener('click', () => {
      const nextAction = root.dataset.paused === 'true' ? 'POMODORO_RESUME' : 'POMODORO_PAUSE';
      chrome.runtime.sendMessage({ type: nextAction });
    });
    document.body.appendChild(root);
  }

  if (!state?.running) {
    root.style.display = 'none';
    return;
  }

  const min = Math.floor(state.remaining / 60);
  const sec = String(state.remaining % 60).padStart(2, '0');
  root.style.display = 'block';
  root.dataset.paused = String(Boolean(state.paused));
  root.textContent = `🔥 Focus: ${state.task?.title || 'Session'}  ⏱ ${min}:${sec} ${state.paused ? '(paused)' : ''}`;
}

chrome.storage.local.get(['pomodoroState']).then((res) => render(res.pomodoroState));
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.pomodoroState) render(changes.pomodoroState.newValue);
});
