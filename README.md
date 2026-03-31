# CorrodedProxyV2 - Android Browser

A Chromium-based (WebView) Android browser app written in Kotlin, designed to match the CorrodedProxyV2 web app aesthetic.

## Features

- **DuckDuckGo** as the default search engine (configurable in settings)
- **Forced dark theme** using WebKit algorithmic darkening + force dark API
- **Multi-tab browsing** with horizontal scrollable tab bar
- **5 visual themes**: Earth (green), Virellus (purple), Neptune (blue), Mars (red), Solar (orange)
- **Context menu** with back, forward, reload, share, copy link, find in page, bookmarks, settings
- **Find in page** bar
- **Download manager** with progress tracking
- **History** with persistent storage (Gson + SharedPreferences)
- **Bookmarks** with persistent storage
- **Settings** page with: search engine selector, JavaScript toggle, cookies toggle, no-referrer toggle, clear history/cookies/cache
- **Mobile-optimized UI**: bottom-facing nav controls, touch-friendly tab strip
- **New tab page** with splash text and search bar
- **Android 13+ (API 33+)** minimum target; targets API 35
- **Chromium user agent** string (Chrome 131 Mobile)

## Project Structure

```
app/
  src/main/
    java/com/corrodedproxy/v2/
      activities/    - MainActivity, SettingsActivity
      adapters/      - TabAdapter, DownloadAdapter
      managers/      - TabManager, HistoryManager, BookmarkManager, DownloadManager, PreferenceManager
      models/        - BrowserTab, HistoryItem, BookmarkItem, DownloadItem, SearchEngine, BrowserTheme, QuickLink
      utils/         - UrlUtils, ThemeUtils
    res/
      layout/        - All XML layouts
      drawable/      - Icons + shape drawables
      values/        - Colors, strings, themes, dimens
      font/          - Inter font family (download separately)
      anim/          - Animations
      mipmap-*/      - Launcher icons
      xml/           - Manifest metadata
```

## Setup in Android Studio

1. Open the `corrodedproxyv2/` folder in Android Studio (Hedgehog or newer)
2. **Add Inter font files** to `app/src/main/res/font/`:
   - `inter_light.ttf`
   - `inter_regular.ttf`
   - `inter_semibold.ttf`
   - `inter_extrabold.ttf`
   Download from: https://fonts.google.com/specimen/Inter
3. Sync Gradle
4. Build & run on an Android 13+ device or emulator

## Build Requirements

- Android Studio Hedgehog 2023.1.1+
- Gradle 8.9
- AGP 8.7.3
- Kotlin 2.1.0
- Java 17
- minSdk 33 (Android 13)
- targetSdk 35 (Android 15)

## Dependencies

- AndroidX Core KTX, AppCompat, Activity
- Material Design 3
- WebKit (AndroidX)
- RecyclerView, ViewPager2
- SwipeRefreshLayout, CoordinatorLayout
- Preference KTX
- Gson (JSON serialization)
- Glide (image loading)

## Permissions

- INTERNET
- ACCESS_NETWORK_STATE
- READ_MEDIA_IMAGES, READ_MEDIA_VIDEO (Android 13+)
- CAMERA (for WebRTC camera access)
- POST_NOTIFICATIONS (downloads)
- WRITE_EXTERNAL_STORAGE (Android ≤9 only)
