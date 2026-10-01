# Kaamzo Android app

Kaamzo is shipped as one mobile app with Worker, Customer, and invite-only Admin surfaces in the same codebase.

## Install the pilot APK

1. Download `download-site/kaamzo-debug.apk` onto an Android phone.
2. Allow installation from this source when Android asks.
3. Install and open **Kaamzo**.

This is a debug/pilot APK for side-loading, not a Play Store release. Production distribution should use a signed release key and Play App Signing or a protected EAS/CI build.

## Rebuild the APK

```bash
npm install
npm run build
npx cap sync android
cd android
./gradlew assembleDebug --no-daemon
```

The output is `android/app/build/outputs/apk/debug/app-debug.apk`.

The public entry offers only **Worker** and **Customer**. Admin access is not exposed in the role picker, footer, or public URL routing; it must be granted by the backend/account flag and then authenticated inside the app.
