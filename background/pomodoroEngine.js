import { StorageKeys, getLocal, setLocal, updateLocal } from '../utils/storage';

const ALARM_NAME = 'focusIslandPomodoroTick';

function nextPhase(state) {
  const isFocus = state.phase === 'focus';
  if (isFocus && state.completedCycles >= state.cycles) return 'long_break';
  return isFocus ? 'break' : 'focus';
}

function phaseDuration(state, phase) {
  if (phase === 'focus') return state.focusDuration;
  if (phase === 'break') return state.breakDuration;
  return state.breakDuration * 3;
}

export async function startPomodoro(task) {
  const initial = {
    running: true,
    paused: false,
    task,
    phase: 'focus',
    remaining: task.focusDuration * 60,
    focusDuration: task.focusDuration,
    breakDuration: task.breakDuration,
    cycles: task.cycles,
    completedCycles: 0,
    lastTick: Date.now()
  };
  await setLocal({ [StorageKeys.POMODORO]: initial });
  await chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 / 60 });
  return initial;
}

export async function pausePomodoro() {
  await updateLocal(StorageKeys.POMODORO, (state) => (state ? { ...state, paused: true } : state));
}

export async function resumePomodoro() {
  await updateLocal(StorageKeys.POMODORO, (state) => (state ? { ...state, paused: false, lastTick: Date.now() } : state));
}

export async function resetPomodoro() {
  await chrome.alarms.clear(ALARM_NAME);
  await setLocal({ [StorageKeys.POMODORO]: null });
}

export async function tickPomodoro() {
  const { [StorageKeys.POMODORO]: state } = await getLocal([StorageKeys.POMODORO]);
  if (!state?.running || state.paused) return null;
  const elapsed = Math.max(1, Math.floor((Date.now() - state.lastTick) / 1000));
  let remaining = state.remaining - elapsed;

  if (remaining > 0) {
    const next = { ...state, remaining, lastTick: Date.now() };
    await setLocal({ [StorageKeys.POMODORO]: next });
    return { done: false, state: next };
  }

  const cycles = state.phase === 'focus' ? state.completedCycles + 1 : state.completedCycles;
  const phase = nextPhase({ ...state, completedCycles: cycles });
  const next = {
    ...state,
    phase,
    completedCycles: cycles,
    remaining: phaseDuration(state, phase) * 60,
    lastTick: Date.now(),
    running: phase === 'long_break' ? false : true
  };
  await setLocal({ [StorageKeys.POMODORO]: next });
  if (phase === 'long_break') await chrome.alarms.clear(ALARM_NAME);
  return { done: true, state: next };
}
