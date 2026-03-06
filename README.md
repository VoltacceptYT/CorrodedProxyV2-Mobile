# VBRT - Vibration Tester

A modern Android application for testing device vibration with adjustable intensity levels. Supports phone vibration and external game controllers (Bluetooth and wired) with automatic device type detection.

## Features

- **Multi-Device Support**: Control vibration on phone and connected game controllers
- **Controller Detection**: Automatically detects Bluetooth and wired game controllers with type icons
- **Adjustable Intensity**: 0-100% vibration intensity control with real-time feedback
- **Graduated Vibration**: 0.5s pattern with increasing intensity levels (20% → 40% → 60% → 80% → 100%)
- **Smart Delays**: 0.1s pauses between vibration levels for controlled testing
- **Device Type Icons**: Visual indicators for Xbox, PlayStation, Phone, and Other devices
- **Android 12+ Support**: Compatible with Android API 31 (Android 12) and above
- **Dark Theme**: Modern dark interface with card-based layout
- **Real-time Status**: Visual feedback showing current vibration state for each device
- **Automatic Cleanup**: Properly stops vibration when app is closed
- **Auto-Toggle Reset**: Switch automatically turns off when vibration pattern completes
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
- Generic Bluetooth gamepads with vibration support

### Wired Controllers 🔌
- USB/USB-C game controllers
- Controllers connected via OTG adapter
- Any controller with Android vibration support

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/VoltacceptYT/Android-Application.git
   cd Android-Application
   ```

2. **Open in Android Studio:**
   - Open Android Studio
   - Select "Open an existing project"
   - Navigate to the cloned repository folder

3. **Build and run:**
   - Connect your Android device or start an emulator
   - Click the "Run" button in Android Studio
   - Grant vibration and Bluetooth permissions when prompted

## Usage

### Basic Operation

1. **Select Device**: Choose from the dropdown:
   - **Phone Vibration**: Test your phone's vibration motor
   - **Connected Controllers**: Any detected game controllers

2. **Adjust Intensity**: Use the slider to set vibration intensity (0-100%)

3. **Test Vibration**: Toggle the switch to run the graduated vibration pattern:
   - **Level 1**: 20% intensity for 500ms
   - **Level 2**: 40% intensity for 500ms  
   - **Level 3**: 60% intensity for 500ms
   - **Level 4**: 80% intensity for 500ms
   - **Level 5**: 100% intensity for 500ms
   - **Smart Delays**: 0.1s pause between each level
   - **Total Duration**: 2.9 seconds complete test pattern

4. **Status Indicator**: Shows current vibration state:
   - **Green**: Device is vibrating
   - **Gray**: Device is idle

### Advanced Features

- **Device Icons**: Automatic icon display based on controller type
- **Intensity Scaling**: All vibration levels scale with the intensity slider
- **Auto-Reset**: Toggle automatically turns off when pattern completes
- **Controller Hot-Swap**: Connect/disconnect controllers without restarting app

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
- `activity_main.xml`: UI layout with device selection, intensity control, and toggle
- `AndroidManifest.xml`: App configuration and permissions

### Vibration Implementation

The app uses Android Vibration API with a sophisticated graduated pattern for comprehensive testing:

- **Android 12+**: Uses `VibratorManager` for enhanced control
- **Intensity Scaling**: Real-time amplitude adjustment (0-255 scale)
- **Controller Vibration**: Uses device-specific vibrators via InputManager
- **Graduated Pattern**: 5-level intensity sequence (20% → 40% → 60% → 80% → 100%)
- **Precise Timing**: 500ms vibration + 100ms pause between each level
- **Total Duration**: 2.9 seconds complete test pattern
- **Amplitude Control**: Supports intensity control on Android 10+ (255 = 100%)
- **No Continuous Loop**: Prevents crashes by using finite pattern instead of infinite

### Dark Theme Design

- **Background**: Deep dark (#111827) for reduced eye strain
- **Cards**: Dark gray (#374151) with subtle borders and shadows
- **Primary Color**: Blue (#6366F1) for interactive elements
- **Accent Color**: Green (#10B981) for success states
- **Typography**: Hierarchical text sizing for clear information architecture
- **Layout**: Vertical card stack with consistent spacing

## Permissions

The app requests the following permissions:

- **Vibration**: Required to control device vibration motors
- **Bluetooth Scan**: Required to discover Bluetooth controllers (Android 12+)
- **Bluetooth Connect**: Required to connect to Bluetooth controllers (Android 12+)
- **Location**: Required for Bluetooth device discovery (Android 10-11, not used for location tracking)

## CI/CD

This project uses GitHub Actions for automated builds:

- **Build Trigger**: Automatically builds on every push to main branch
- **Debug APK**: Generates debug APK for testing
- **Gradle Wrapper**: Uses Gradle 8.4 for consistent builds
- **Java 17**: Uses latest stable Java version
- **Updated Actions**: Uses GitHub Actions v4 for security and performance

### Build Status

[![Build Status](https://github.com/VoltacceptYT/Android-Application/workflows/Android%20CI/badge.svg)](https://github.com/VoltacceptYT/Android-Application/actions)

## Troubleshooting

### Common Issues

1. **Controller Not Detected**:
   - Ensure Bluetooth is enabled
   - Check controller is in pairing mode
   - Verify controller supports vibration
   - Restart the app after connecting

2. **Vibration Not Working**:
   - Check device has vibration capability
   - Ensure vibration permission is granted
   - Try different intensity levels
   - Restart the app

3. **App Crashes**:
   - Check Android version compatibility (12+ required)
   - Ensure sufficient device storage
   - Report issue with device details

### Device Compatibility

- **Tested Devices**: Samsung Galaxy S21, Pixel 6, OnePlus 9
- **Tested Controllers**: Xbox Series X, PS5 DualSense, generic Bluetooth gamepads
- **Known Issues**: Some older controllers may not report vibration capability correctly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. See the LICENSE file for details.

## Changelog

### v1.0.0
- Initial release with VBRT branding
- Dark theme implementation
- Intensity slider control
- Auto-toggle reset feature
- Controller support with device type detection
- Graduated vibration pattern
- Android 12+ compatibility
- Grant all requested Bluetooth permissions
- Check system Bluetooth settings
- Restart the app after granting permissions

**Build errors?**
- Make sure you have Android SDK installed
- Update Gradle wrapper if needed
- Check Java version compatibility

## Support

For issues and feature requests, please open an issue on the [GitHub repository](https://github.com/yourusername/mobile-vibrator/issues).
