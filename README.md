# Mobile Vibrator

A simple Android application for controlling device vibration with maximum intensity using a toggle button.

## Features

- **Maximum Vibration Control**: Toggle vibration on/off at maximum speed
- **Android 10+ Support**: Compatible with Android API 29 (Android 10) and above
- **Clean UI**: Modern Material Design interface with dark theme
- **Real-time Status**: Visual feedback showing current vibration state
- **Automatic Cleanup**: Properly stops vibration when app is closed

## Requirements

- Android 10 (API level 29) or higher
- Device with vibration capability
- Vibration permission (automatically requested)

## Installation

### Option 1: Build from Source

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/mobile-vibrator.git
   cd mobile-vibrator
   ```

2. Build the APK:
   ```bash
   ./gradlew assembleDebug
   ```

3. Install the APK:
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

### Option 2: Download APK

Download the latest APK from the [Releases](https://github.com/yourusername/mobile-vibrator/releases) section.

## Usage

1. Open the Mobile Vibrator app
2. Use the toggle button to start/stop vibration
3. The status indicator shows whether vibration is active
4. Vibration automatically stops when you close the app

## Technical Details

- **Language**: Kotlin
- **Minimum SDK**: 29 (Android 10)
- **Target SDK**: 34 (Android 14)
- **Build Tool**: Gradle 8.0
- **UI Framework**: Material Design Components

### Key Components

- `MainActivity.kt`: Main activity handling vibration logic
- `activity_main.xml`: UI layout with toggle button
- `AndroidManifest.xml`: App configuration and permissions

### Vibration Implementation

The app uses the Android Vibration API with proper handling for different Android versions:

- **Android 12+**: Uses `VibratorManager` for enhanced control
- **Android 10-11**: Uses traditional `Vibrator` service
- **Continuous Vibration**: Creates infinite waveform pattern for maximum effect

## GitHub Actions CI/CD

This project includes a GitHub Actions workflow that automatically:

- Builds debug and release APKs
- Runs unit tests
- Performs lint analysis
- Uploads build artifacts

The workflow triggers on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

## Permissions

The app requires only one permission:

- `android.permission.VIBRATE`: Required to control device vibration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

**Vibration not working?**
- Ensure your device has vibration hardware
- Check if vibration is enabled in system settings
- Verify the app has vibration permission

**Build errors?**
- Make sure you have Android SDK installed
- Update Gradle wrapper if needed
- Check Java version compatibility

## Support

For issues and feature requests, please open an issue on the [GitHub repository](https://github.com/yourusername/mobile-vibrator/issues).
