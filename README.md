# CorrodedProxyV2 Android

A modern Android web browser application that provides a 1:1 experience matching the desktop CorrodedProxyV2. Features tab management, navigation controls, theme support, and a complete browsing experience with WebView integration.

## Features

- **Tab Management**: Multiple tabs with individual WebView instances, visual active tab indication, and seamless tab switching
- **Navigation Controls**: Full browser navigation with back, forward, reload, and home buttons
- **URL/Search Bar**: Intelligent URL handling with automatic search for non-URL queries
- **Settings System**: Theme selection (Earth, Virellus, Neptune, Mars, Solar) and browser preferences
- **Context Menu**: Long-press context menu with navigation and settings options
- **Dark Theme**: Modern dark interface matching desktop version (#222 background, #333 UI elements)
- **Icon-Based UI**: Clean, intuitive interface with Material Design icons
- **Responsive Design**: Optimized for various screen sizes and orientations

## Requirements

- Android 12 (API level 31) or higher
- Internet connection for web browsing
- WebView support (included in Android)

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
   - Grant internet permission when prompted

## Usage

### Basic Browsing

1. **Navigate Websites**: Enter URLs or search queries in the address bar
   - **URL Entry**: Type full URLs (e.g., `https://example.com`)
   - **Search**: Type search terms for automatic Google search
   - **Smart Detection**: Automatically detects URLs vs. search queries

2. **Tab Management**:
   - **Add Tab**: Click the + button to create new tabs
   - **Switch Tabs**: Click on any tab to switch between web pages
   - **Close Tabs**: Click the X button on active tabs to close them
   - **Visual Feedback**: Active tab highlighted with different background

3. **Navigation Controls**:
   - **Back**: Navigate to previous page in history
   - **Forward**: Navigate to next page in history
   - **Reload**: Refresh the current page
   - **Home**: Reset to blank page

### Advanced Features

- **Settings**: Access theme selection and browser preferences
- **Context Menu**: Long-press on web content for additional options
- **Tab Persistence**: Each tab maintains its own browsing history and state
- **URL Bar Updates**: Address bar automatically updates with current page URL

## Technical Details

- **Language**: Kotlin
- **Minimum SDK**: 31 (Android 12)
- **Target SDK**: 33 (Android 13)
- **Build Tool**: Gradle 8.0
- **UI Framework**: Android Views with custom layouts
- **Web Engine**: Android WebView with JavaScript support

### Key Components

- `MainActivity.kt`: Main browser activity with tab management and navigation
- `SettingsActivity.kt`: Settings screen for theme and browser preferences
- `activity_main.xml`: Main browser interface with tabs, navigation, and webview
- `tab_item.xml`: Individual tab layout with title and close button
- `activity_settings.xml`: Settings interface with theme selection
- `context_menu.xml`: Context menu popup for web content

### Tab System Implementation

- **WebView Management**: Each tab contains an independent WebView instance
- **State Tracking**: Proper tab state management with current tab tracking
- **Visual Updates**: Real-time tab title and favicon updates
- **Memory Management**: Efficient WebView lifecycle management

### Theme System

- **Desktop Matching**: Same theme options as desktop CorrodedProxyV2
- **Persistent Storage**: Theme preferences saved in SharedPreferences
- **Real-time Switching**: Immediate theme changes without app restart

### WebView Configuration

- **JavaScript Enabled**: Full JavaScript support for modern web applications
- **DOM Storage**: Local storage and session storage support
- **Responsive Design**: Proper viewport configuration for mobile web pages
- **Error Handling**: Graceful error handling for network issues

## UI Design

### Color Scheme

- **Primary Background**: #222 (Dark gray)
- **UI Elements**: #333 (Medium gray)
- **Active Elements**: #444 (Light gray)
- **Text**: #fff (White)
- **Input Fields**: #4545459e (Semi-transparent gray)

### Layout Structure

- **Top Navigation**: Tab bar with add tab and settings buttons
- **Navigation Bar**: URL bar with navigation controls
- **Content Area**: WebView container with proper margins
- **Responsive Design**: Adapts to different screen orientations

## Permissions

The app requests the following permissions:

- **Internet**: Required for web browsing and loading web content

## CI/CD

This project uses GitHub Actions for automated builds:

- **Build Trigger**: Automatically builds on every push to main branch
- **Debug APK**: Generates debug APK for testing
- **Gradle Wrapper**: Uses Gradle 8.4 for consistent builds
- **Java 17**: Uses latest stable Java version

### Build Status

[![Build Status](https://github.com/VoltacceptYT/Android-Application/workflows/Android%20CI/badge.svg)](https://github.com/VoltacceptYT/Android-Application/actions)

## Troubleshooting

### Common Issues

1. **Pages Not Loading**:
   - Check internet connection
   - Verify URL is correct
   - Try reloading the page

2. **JavaScript Not Working**:
   - JavaScript is enabled by default
   - Some sites may block WebView access
   - Check site compatibility

3. **Tab Issues**:
   - Minimum one tab is always maintained
   - Tab closing is disabled when only one tab exists
   - Try restarting app if tabs become unresponsive

4. **Settings Not Saving**:
   - Check app storage permissions
   - Restart app after changing settings
   - Verify theme selection is applied

### Performance Tips

- **Tab Management**: Close unused tabs to improve performance
- **Memory Usage**: Limit number of open tabs on older devices
- **Network**: Use Wi-Fi for better browsing performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on multiple devices
5. Submit a pull request

### Development Guidelines

- Follow Android Material Design principles
- Maintain consistency with desktop CorrodedProxyV2
- Test on various screen sizes and Android versions
- Ensure proper memory management for WebView instances

## License

This project is open source. See the LICENSE file for details.

## Changelog

### v1.0.0
- Initial release with 1:1 desktop CorrodedProxyV2 experience
- Complete tab management system with visual feedback
- Full navigation controls and URL bar functionality
- Settings system with theme selection
- Context menu implementation
- Dark theme matching desktop version
- WebView integration with JavaScript support
- Responsive design for various screen sizes

---

**CorrodedProxyV2 Android** - Mobile Web Browser

For issues and feature requests, please open an issue on the [GitHub repository](https://github.com/VoltacceptYT/Android-Application/issues).
