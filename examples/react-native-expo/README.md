# Quiltt React Native Expo Example 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app) that demonstrates how to integrate Quiltt Connector into a React Native application.

For more information about Quiltt and the available packages, see:

- [Main Repository README](../../README.md)
- [@quiltt/react-native Documentation](../../packages/react-native#readme)
- [Quiltt Developer Docs](https://quiltt.dev)

## Get started

1. Install dependencies

   ```bash
   pnpm install
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

## Run the example app

Follow these steps to run the example locally with Expo.

- **Set environment variables:** Copy the example env and edit if needed:

```bash
cp .env.example .env
# edit .env to set values if required
```

- **Install dependencies:**

```bash
pnpm install
```

- **Start Expo metro/dev server:**

```bash
npx expo start
# or
pnpm run dev
```

- **Open on iOS Simulator (macOS + Xcode installed):**

```bash
npx expo run:ios
# or
pnpm run ios
```

- **Open on Android emulator (Android Studio installed):**

```bash
npx expo run:android
# or
pnpm run android
```

- **Open in Expo Go (phone):** Scan the QR code shown by `expo start` with Expo Go.

- **Run on web:**

```bash
pnpm run web
```

Notes:

- If you rely on the included `.env` values for the Quiltt client ID and token, ensure those keys are present before starting the app.
- Running on iOS/Android with `run:ios`/`run:android` requires native build tools (Xcode/Android Studio) and a compatible device/emulator.
- For CI or end-to-end tests, see the `test:*` scripts in `package.json`.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
