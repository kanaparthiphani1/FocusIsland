# FocusIsland – Productivity Chrome Extension (Manifest V3)

FocusIsland is a production-structured Chrome extension for Chromium browsers (Chrome, Edge, Brave, Arc) that provides:

- Active tab/domain tracking
- Pomodoro task system
- Dynamic Island-style floating timer
- Focus mode website blocking
- Analytics dashboard with Chart.js
- Firebase Auth + Firestore sync + Analytics events

## Project Structure

```txt
focus-island-extension/
├── manifest.json
├── background/
│   ├── serviceWorker.js
│   ├── tabTracker.js
│   ├── pomodoroEngine.js
│   ├── firebaseSync.js
│   └── blocker.js
├── content/
│   └── floatingTimer.js
├── popup/
│   ├── popup.html
│   ├── popup.jsx
│   └── popup.css
├── dashboard/
│   ├── dashboard.html
│   └── dashboard.jsx
├── auth/
│   ├── login.html
│   ├── login.jsx
│   └── blocked.html
├── firebase/
│   ├── firebaseConfig.js
│   ├── firebaseAuth.js
│   ├── firestoreService.js
│   └── analyticsService.js
├── utils/
│   ├── storage.js
│   └── timeUtils.js
├── styles/main.css
├── assets/
│   └── icons/ (generated at build in dist/)
├── firestore.rules
└── .env.example
```

## Firebase Setup Instructions

1. Create a Firebase project in Firebase Console.
2. Enable Authentication providers:
   - Google
   - Email/Password
3. Enable Cloud Firestore in production mode.
4. Add a Web App and copy config values into `.env` from `.env.example`.
5. Deploy Firestore rules from `firestore.rules`.

## Build & Install

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build extension:
   ```bash
   npm run build
   ```
3. Open `chrome://extensions`.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the `dist/` directory.

## Notes

- Local tracking writes every 30 seconds via alarm flush.
- Firestore sync runs every 5 minutes using a batched sync flow.
- Blocking is done with dynamic `declarativeNetRequest` rules.


## Binary Asset Strategy

- To keep PR diffs text-only for tooling compatibility, binary files are generated during build.
- `npm run build` now runs `scripts/generate-assets.mjs` to emit placeholder `dist/assets/icons/*.png` and `dist/assets/sound.mp3`.
- In production, replace the generated placeholders with your real brand icons and notification sound in CI/release packaging.
