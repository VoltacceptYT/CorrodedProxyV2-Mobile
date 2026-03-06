# VBRT - A Girl's Best Friend

A modern Android application for testing device vibration with adjustable intensity levels. Supports phone vibration and external game controllers (Bluetooth and wired) with automatic device type detection.

## Features

- **Multi-Device Support**: Control vibration on phone and connected game controllers
- **Controller Detection**: Automatically detects Bluetooth and wired game controllers with type icons
- **Adjustable Intensity**: 0-100% vibration intensity control with real-time feedback
- **Infinite Vibration**: Continuous vibration that runs until manually stopped
- **Live Updates**: Real-time intensity changes while vibrating
- **Smart Delays**: 10-second cycles with seamless restart for continuous operation
- **Device Type Icons**: Visual indicators for Xbox, PlayStation, Phone, and Other devices
- **Android 12+ Support**: Compatible with Android API 31 (Android 12) and above
- **Hot Pink Theme**: Modern hot pink and bubblegum pink interface with card-based layout
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

3. **Start Vibration**: Toggle the switch to start infinite vibration:
   - **Continuous**: Vibration runs indefinitely until manually stopped
   - **Live Updates**: Adjust intensity in real-time while vibrating
   - **10-Second Cycles**: Seamless restart every 10 seconds for continuous operation
   - **Infinite Loop**: Vibration automatically restarts to run forever

4. **Status Indicator**: Shows current vibration state:
   - **Pink**: Device is vibrating
   - **Gray**: Device is idle

### Advanced Features

- **Device Icons**: Automatic icon display based on controller type
- **Intensity Scaling**: All vibration levels scale with the intensity slider
- **Live Control**: Change intensity while vibrating without interruption
- **Infinite Operation**: No automatic shutdown - runs until manually stopped
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

The app uses Android Vibration API with infinite vibration capability and real-time intensity control:

- **Android 12+**: Uses `VibratorManager` for enhanced control
- **Intensity Scaling**: Real-time amplitude adjustment (0-255 scale)
- **Controller Vibration**: Uses device-specific vibrators via InputManager
- **Infinite Operation**: 10-second cycles with automatic restart for continuous vibration
- **Live Updates**: Intensity changes apply immediately while vibrating
- **Precise Timing**: 10-second vibration cycles with seamless restart
- **Amplitude Control**: Supports intensity control on Android 10+ (255 = 100%)
- **Infinite Loop**: Automatic restart ensures continuous operation until manual stop

### Hot Pink Theme Design

- **Background**: Deep purple-tinted (#1A0D15) for reduced eye strain
- **Cards**: Purple-tinted (#402940) with hot pink borders and shadows
- **Primary Color**: Hot pink (#FF1493) for interactive elements
- **Accent Color**: Bubblegum pink (#FF69B4) for success states and switch thumb
- **Typography**: Hierarchical text sizing with pink-tinted colors
- **Layout**: Vertical card stack with consistent spacing
- **Switch Track**: Slightly darker than cards (#352235) for visual contrast

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
- Hot pink and bubblegum pink theme implementation
- Intensity slider control with live updates
- Infinite vibration capability with 10-second cycles
- Controller support with device type detection
- Real-time intensity adjustment while vibrating
- Android 12+ compatibility
- Automatic vibration restart for continuous operation

---

**VBRT** - A Girl's Best Friend

For issues and feature requests, please open an issue on the [GitHub repository](https://github.com/yourusername/mobile-vibrator/issues).
