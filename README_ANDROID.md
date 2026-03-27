# TubeAI Studio - Android App Version

This project has been configured with **Capacitor** to run as a native Android application.

## Prerequisites

- **Android Studio**: Installed and configured on your machine.
- **Android SDK**: Latest version recommended.
- **Node.js**: Installed.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Build the Web Application**:
    ```bash
    npm run build
    ```

3.  **Sync with Android**:
    ```bash
    npx cap sync
    ```

4.  **Open in Android Studio**:
    ```bash
    npx cap open android
    ```

5.  **Build and Run**:
    In Android Studio, select your device/emulator and click the **Run** button.

## Native Features Implemented

- **Status Bar**: Styled to match the app's dark theme.
- **Back Button**: Handles navigation and app exit on Android.
- **Permissions**: Pre-configured for Internet, Camera, Microphone, and Media access.

## Scripts

- `npm run cap:sync`: Syncs web assets with the Android project.
- `npm run cap:open:android`: Opens the project in Android Studio.
- `npm run cap:build:android`: Builds the web app, syncs, and opens Android Studio.
