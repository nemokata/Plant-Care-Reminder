Perenual Plant API setup

This project now uses the Perenual Plant Open API (https://perenual.com/docs/plant-open-api).

Important: do NOT commit your API key to the repo. Instead set it in your environment.

Local dev (PowerShell)

```powershell
$env:EXPO_PUBLIC_PERENUAL_KEY = "YOUR_KEY_HERE"
npx expo start
```

Local dev (bash / macOS / Linux)

```bash
export EXPO_PUBLIC_PERENUAL_KEY=YOUR_KEY_HERE
npx expo start
```

Notes
- The app reads the key from `process.env.EXPO_PUBLIC_PERENUAL_KEY`.
- If you prefer to store it in `app.json` under `expo.extra`, use a secure method and do not commit the key.
- If search results look different from the previous API, adjust mapping in `services/plant-api.ts`.

If you want, I can help wire detailed species details endpoints (fetch by id) and show how to cache images for offline use.
