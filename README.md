# Mobile Vibrator

A comprehensive Android application for controlling device vibration with maximum intensity using a toggle button. Supports both phone vibration and external game controllers (Bluetooth and wired).

## Features

- **Multi-Device Support**: Control vibration on phone and connected game controllers
- **Controller Detection**: Automatically detects Bluetooth and wired game controllers
- **Maximum Vibration Control**: Toggle vibration on/off at maximum speed
- **Android 10+ Support**: Compatible with Android API 29 (Android 10) and above
- **Clean UI**: Modern Material Design interface with dark theme and device selection
- **Real-time Status**: Visual feedback showing current vibration state for each device
- **Automatic Cleanup**: Properly stops vibration when app is closed
- **Bluetooth Support**: Full Bluetooth controller compatibility with proper permissions

## Requirements

- Android 10 (API level 29) or higher
- Device with vibration capability
- Vibration permission (automatically requested)
- Bluetooth permissions for controller support (automatically requested)
- Optional: Game controller with vibration capability

## Supported Controllers

### Bluetooth Controllers
- Xbox Wireless Controller
- PlayStation DualShock/DualSense controllers
- Nintendo Switch Pro Controller
- Third-party Bluetooth gamepads
- Any Bluetooth controller with vibration support

### Wired Controllers
- USB game controllers
- Connected gamepads via OTG
- Any wired controller with vibration motors

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
2. Grant requested permissions (Vibration and Bluetooth)
3. Select your desired device from the dropdown:
   - **Phone Vibration**: Control the phone's built-in vibration
   - **Controller Name**: Control a connected game controller
4. Use the toggle button to start/stop vibration
5. The status indicator shows which device is vibrating
6. Vibration automatically stops when you close the app

## Technical Details

- **Language**: Kotlin
- **Minimum SDK**: 29 (Android 10)
- **Target SDK**: 34 (Android 14)
- **Build Tool**: Gradle 8.0
- **UI Framework**: Material Design Components
- **Controller API**: Android InputManager and Vibration API

### Key Components

- `MainActivity.kt`: Main activity handling vibration logic and device selection
- `ControllerManager.kt`: Manages controller detection and vibration
- `activity_main.xml`: UI layout with device selection and toggle button
- `AndroidManifest.xml`: App configuration and permissions

### Vibration Implementation

The app uses the Android Vibration API with proper handling for different Android versions:

- **Android 12+**: Uses `VibratorManager` for enhanced control
- **Android 10-11**: Uses traditional `Vibrator` service
- **Controller Vibration**: Uses device-specific vibrators via InputManager
- **Continuous Vibration**: Creates infinite waveform pattern for maximum effect
- **Amplitude Control**: Supports intensity control on Android 10+

### Controller Detection

The app automatically detects connected controllers using:
- **InputManager**: Monitors device connections/disconnections
- **Device Classification**: Identifies gamepads, joysticks, and controllers
- **Bluetooth Detection**: Recognizes Bluetooth vs wired connections
- **Vibration Capability**: Checks if controller supports vibration

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

The app requires the following permissions:

- `android.permission.VIBRATE`: Required to control device vibration
- `android.permission.BLUETOOTH`: Required for Bluetooth controller support
- `android.permission.BLUETOOTH_ADMIN`: Required for Bluetooth device management
- `android.permission.BLUETOOTH_CONNECT`: Required for Bluetooth connections (Android 12+)
- `android.permission.BLUETOOTH_SCAN`: Required for Bluetooth device scanning (Android 12+)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with multiple device types
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

**Vibration not working on phone?**
- Ensure your device has vibration hardware
- Check if vibration is enabled in system settings
- Verify the app has vibration permission

**Controller not detected?**
- Ensure Bluetooth is enabled and controller is paired
- Check if controller supports vibration
- Verify Bluetooth permissions are granted
- Try reconnecting the controller

**Bluetooth permissions issues?**
- Grant all requested Bluetooth permissions
- Check system Bluetooth settings
- Restart the app after granting permissions

**Build errors?**
- Make sure you have Android SDK installed
- Update Gradle wrapper if needed
- Check Java version compatibility

## Support

For issues and feature requests, please open an issue on the [GitHub repository](https://github.com/yourusername/mobile-vibrator/issues).
