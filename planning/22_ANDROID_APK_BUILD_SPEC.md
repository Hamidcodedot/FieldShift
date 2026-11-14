# Feature Specification: Android APK Build & Native Packaging

> **Specification Status:** Implemented & Verified  
> **Target Scope:** Capacitor Android Native Build, Gradle compilation (`assembleDebug`), OpenJDK 21 toolchain configuration, and APK artifact generation.  
> **Author:** Antigravity / Engineering  
> **Date:** 2026-11-03  

---

## 1. Executive Summary

### 1.1. User Directive
> *"build the apk file so that i can run it on my mobile"*

### 1.2. Build Pipeline & Environment Setup
1. **Toolchain Requirement:**  
   Capacitor 8.5.2 Android library sets `JavaVersion.VERSION_21`. Installed OpenJDK 21 (`Microsoft.OpenJDK.21` version `21.0.13.21-hotspot`).
2. **SDK Configuration:**  
   Updated [`android/local.properties`](file:///z:/Nasa-Space-App/android/local.properties) to point to the active user's Android SDK:
   `sdk.dir=C:/Users/Hamid Shahid/AppData/Local/Android/Sdk`
3. **Web Asset Sync:**  
   Executed `npm run build` (`tsc -b && vite build`) and `npx cap sync android` to copy the latest production assets and plugins into `android/app/src/main/assets/public/`.
4. **Gradle Compilation:**  
   Compiled the debug binary using `./gradlew.bat assembleDebug` in 2m 27s.

---

## 2. Generated APK Artifacts

| Binary | Location | File Size |
| :--- | :--- | :--- |
| **FieldShift-debug.apk** (Root Shortcut) | [`FieldShift-debug.apk`](file:///z:/Nasa-Space-App/FieldShift-debug.apk) | 4.61 MB |
| **app-debug.apk** (Gradle Output) | [`android/app/build/outputs/apk/debug/app-debug.apk`](file:///z:/Nasa-Space-App/android/app/build/outputs/apk/debug/app-debug.apk) | 4.61 MB |

---

## 3. Installation Guide on Mobile (Android)

1. **Transfer to Device:**
   - Connect your Android phone to your PC via USB cable and copy [`FieldShift-debug.apk`](file:///z:/Nasa-Space-App/FieldShift-debug.apk) to your **Downloads** or **Internal Storage** folder.
   - Alternatively, share via Google Drive, WhatsApp, or Quick Share / Nearby Share.
2. **Install APK:**
   - On your Android phone, open your **Files** or **Downloads** app.
   - Tap `FieldShift-debug.apk`.
   - If prompted with *"Install unknown apps"* or *"Allow from this source"*, toggle permission to **Allow**.
   - Tap **Install**.
3. **Permissions Granted:**
   - **Location (GPS):** Required for 1-tap farm parcel detection and NASA single-point satellite coordinates.
   - **Internet:** Required to query NASA POWER and Open-Meteo live satellite APIs.
   - **Microphone (Optional):** Used for voice speech recognition in the Field AI Assistant.
