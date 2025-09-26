# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Plant Search Feature

The Explore tab has been converted into a plant search screen powered by the **house-plants** RapidAPI.

### Setup API Key

1. Create an account (or log in) at RapidAPI and subscribe to the `house-plants2` API.
2. Copy your API key.
3. Expose it to the Expo app using a public env var (safe only for non-sensitive / rate-limited keys—you may later proxy this).

Create (or edit) a `.env` file in the project root:

```bash
echo EXPO_PUBLIC_RAPIDAPI_KEY=YOUR_KEY_HERE > .env
```

Expo automatically loads `EXPO_PUBLIC_*` variables at build time. Restart the dev server after adding it.

### How it works

- Service file: `services/plant-api.ts` exports `searchPlants(query)`.
- It reads `process.env.EXPO_PUBLIC_RAPIDAPI_KEY` and sends headers:
   - `x-rapidapi-host: house-plants2.p.rapidapi.com`
   - `x-rapidapi-key: <your key>`
- Basic mapping of watering guidance → approximate interval days (see `inferWateringIntervalDays`).

### Using the screen

1. Start the app: `npx expo start`.
2. Open the Explore tab.
3. Type a plant name (e.g., "Fern", "Aloe", "Monstera"). Results populate after a short debounce.
4. Each result shows:
    - Common/scientific name
    - Watering guidance (simplified to interval if possible)

### Future Improvements

- Persist selected plants into a local store.
- Dedicated detail screen with sunlight, toxicity, growth rate, etc.
- Add image thumbnails (`default_image.small_url`).
- Add offline cache (AsyncStorage or MMKV).
- Introduce a backend proxy to hide the API key for production.

