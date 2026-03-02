# quiltt_connector example

Demonstrates how to use the quiltt_connector plugin.

## Getting Started

For help getting started with Flutter, view our online
[documentation](https://flutter.io/).

## Run the example (iOS simulator)

1. Open the iOS simulator:

```sh
open -a Simulator
```

1. List available devices and copy the simulator ID:

```sh
flutter devices
```

1. Run the example on the simulator:

```sh
flutter run -d <SIMULATOR_ID>
```

If you do not see a simulator listed, open a device from the Simulator app menu and re-run `flutter devices`.

## Run the example (Android emulator)

1. Start an Android emulator from Android Studio (Device Manager).

1. List available devices and copy the emulator ID:

```sh
flutter devices
```

1. Run the example on the emulator:

```sh
flutter run -d <EMULATOR_ID>
```

If no emulators appear, run `flutter emulators` to list available AVDs, then start one with `flutter emulators --launch <EMULATOR_ID>`.

## Common debugging steps

1. Verify your Flutter and Dart versions:

```sh
which flutter
flutter --version
```

1. Clean build artifacts and re-run:

```sh
flutter clean
flutter run -d <DEVICE_ID>
```

1. Check the toolchain and device setup:

```sh
flutter doctor -v
flutter devices
```

1. Re-download iOS artifacts if the compiler fails to start:

```sh
flutter precache --ios
```

1. Re-resolve dependencies:

```sh
flutter pub get
```
