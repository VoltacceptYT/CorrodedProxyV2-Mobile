# Device Vibration Tester

A comprehensive Android application for testing device vibration with graduated intensity levels. Supports phone vibration and external game controllers (Bluetooth and wired) with automatic device type detection.

## Features

- **Multi-Device Support**: Control vibration on phone and connected game controllers
- **Controller Detection**: Automatically detects Bluetooth and wired game controllers with type icons
- **Graduated Vibration**: 0.5s pattern with increasing intensity levels (20% → 40% → 60% → 80% → 100%)
- **Smart Delays**: 0.1s pauses between vibration levels for controlled testing
- **Device Type Icons**: Visual indicators for Xbox, PlayStation, Phone, and Other devices
- **Android 12+ Support**: Compatible with Android API 31 (Android 12) and above
- **Clean UI**: Modern Material Design interface with dark theme and device selection
- **Real-time Status**: Visual feedback showing current vibration state for each device
- **Automatic Cleanup**: Properly stops vibration when app is closed
- **Bluetooth Support**: Full Bluetooth controller compatibility with proper permissions

## Requirements

- Android 12 (API level 31) or higher
- Device with vibration capability
- Vibration permission (automatically requested)
- Bluetooth permissions for controller support (automatically requested)
- Optional: Game controller with vibration capability

## Supported Controllers

### Bluetooth Controllers 🎮
- Xbox Wireless Controller ![Xbox](xbox.svg)
- PlayStation DualShock/DualSense controllers ![PlayStation](playstation.svg)
- Nintendo Switch Pro Controller
- Third-party Bluetooth gamepads
- Any Bluetooth controller with vibration support

### Wired Controllers 🎮
- USB game controllers
- Connected gamepads via OTG
- Any wired controller with vibration motors

### Device Icons
- 📱 Phone Vibration - Built-in device vibration
- 🎮 Xbox Controllers - Microsoft Xbox controllers
- 🎮 PlayStation Controllers - Sony PlayStation controllers  
- 🎮 Other Controllers - Generic and third-party controllers

## Installation

### Option 1: Build from Source

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/device-vibration-tester.git
   cd device-vibration-tester
   ```

2. Build APK:
   ```bash
   ./gradlew assembleDebug
   ```

3. Install APK:
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

### Option 2: Download APK

Download the latest APK from [Releases](https://github.com/yourusername/device-vibration-tester/releases) section.

## Usage

1. Open Device Vibration Tester app
2. Grant requested permissions (Vibration and Bluetooth)
3. Select your desired device from the dropdown menu:
   - **📱 Phone Vibration**: Test the phone's built-in vibration motor
   - **🎮 [Controller Name]**: Test connected game controllers with type icons
4. Use the toggle button to start the vibration test pattern
5. Watch the graduated intensity sequence:
   - **Level 1**: 20% intensity for 500ms
   - **Level 2**: 40% intensity for 500ms  
   - **Level 3**: 60% intensity for 500ms
   - **Level 4**: 80% intensity for 500ms
   - **Level 5**: 100% intensity for 500ms
6. The status indicator shows which device is currently vibrating
7. Vibration automatically stops after the complete 2.9-second pattern

## Technical Details

- **Language**: Kotlin
- **Minimum SDK**: 31 (Android 12)
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

The app uses Android Vibration API with a sophisticated graduated pattern for comprehensive testing:

- **Android 12+**: Uses `VibratorManager` for enhanced control
- **Android 10-11**: Uses traditional `Vibrator` service
- **Controller Vibration**: Uses device-specific vibrators via InputManager
- **Graduated Pattern**: 5-level intensity sequence (20% → 40% → 60% → 80% → 100%)
- **Precise Timing**: 500ms vibration + 100ms pause between each level
- **Total Duration**: 2.9 seconds complete test pattern
- **Amplitude Control**: Supports intensity control on Android 10+ (255 = 100%)
- **No Continuous Loop**: Prevents crashes by using finite pattern instead of infinite

### Controller Detection

The app automatically detects connected controllers using:
- **InputManager**: Monitors device connections/disconnections in real-time
- **Device Classification**: Identifies gamepads, joysticks, and controllers by name and source
- **Type Recognition**: Distinguishes Xbox, PlayStation, and generic controllers
- **Connection Detection**: Recognizes Bluetooth vs wired connections
- **Vibration Capability**: Tests and displays device vibration support status

## GitHub Actions CI/CD

This project includes a GitHub Actions workflow that automatically:

- Builds debug APK only (optimized for CI/CD)
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
