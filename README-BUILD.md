# Build Guide - Wemos D1 Pro APK

Panduan lengkap untuk membangun APK dengan support alarm dan notifikasi yang dapat membangunkan ponsel saat terkunci.

## Requirements

### Software
- **Node.js**: v18 atau lebih tinggi
- **npm**: v9 atau lebih tinggi
- **Java SDK**: JDK 17 (temurin recommended)
- **Android SDK**: API Level 34 (Android 13)
- **Android Build Tools**: 34.0.0
- **Gradle**: 7.6.2 atau lebih tinggi

### Hardware
- Minimum 8GB RAM
- 10GB free disk space

## Installation

### 1. Setup Java & Android SDK

```bash
# Install Java 17 (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install openjdk-17-jdk-headless

# Or use SDKMAN
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
sdk install java 17.0.7-tem
```

### 2. Setup Android SDK

```bash
# Download Android SDK (atau gunakan Android Studio)
# Set environment variables
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk

# Verify
java -version
```

### 3. Install Cordova CLI

```bash
npm install -g cordova
cordova --version
```

### 4. Clone & Setup Project

```bash
git clone https://github.com/ncehah-boop/wemos-pro.git
cd wemos-pro

# Install dependencies
npm install

# Add Android platform
cordova platform add android@13.0.0

# Install plugins
npm run plugin:add:all
```

## Build Instructions

### Check Requirements

```bash
cordova requirements android
```

Output yang diharapkan:
```
Android Studio project detected
✓ Java JDK: installed  /usr/lib/jvm/java-17-openjdk
✓ Android SDK: installed  /home/user/Android/Sdk
✓ Android target: installed  android-34
✓ Gradle: installed  /home/user/.gradle/wrapper/dists/gradle-7.6.2
```

### Build APK (Debug)

```bash
npm run build:debug
# atau
cordova build android --debug
```

Output: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`

### Build APK (Release/Unsigned)

```bash
npm run build
# atau
cordova build android --release
```

Output: `platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Sign Release APK (Untuk Production)

#### 1. Generate Keystore

```bash
keytool -genkey -v -keystore my-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

Jawab pertanyaan yang muncul dan catat password.

#### 2. Sign APK

```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore my-key.keystore \
  platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk \
  my-key-alias

# Verify signature
jarsigner -verify -verbose -certs platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
```

#### 3. Align APK

```bash
# Build tools path
ZIPALIGN=$ANDROID_HOME/build-tools/34.0.0/zipalign

$ZIPALIGN -v 4 \
  platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk \
  app-release.apk
```

### Run on Device

```bash
# Via USB (pastikan adb sudah terinstall)
adb devices
cordova run android

# atau debug APK
adb install -r platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

## Features & Permissions

### Alarm & Notification Features
- ✅ **Full-screen notification** saat alarm trigger
- ✅ **Bunyi alarm** even saat ponsel terkunci
- ✅ **Vibration pattern** (SOS, warning, notification)
- ✅ **Wake lock** - jaga layar tetap hidup
- ✅ **Background mode** - tetap running di background
- ✅ **Scheduled alarms** - alarm terjadwal
- ✅ **Snooze feature** - snooze 5 menit

### Permissions (dari config.xml)
```
- android.permission.POST_NOTIFICATIONS (Android 13+)
- android.permission.DISABLE_KEYGUARD
- android.permission.WAKE_LOCK
- android.permission.VIBRATE
- android.permission.SCHEDULE_EXACT_ALARM
- android.permission.USE_FULL_SCREEN_INTENT
- android.permission.INTERNET
- android.permission.MODIFY_AUDIO_SETTINGS
```

## Troubleshooting

### Error: "Failed to find Build Tools revision"

```bash
# Download build tools melalui SDK Manager
android list sdk --all | grep "build-tools-34"
android update sdk --no-ui --all --filter build-tools-34.0.0

# atau manual
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "build-tools;34.0.0"
```

### Error: "Java version mismatch"

```bash
# Set JAVA_HOME correctly
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
# Verify
$JAVA_HOME/bin/java -version
```

### Error: "Gradle sync failed"

```bash
# Clean gradle cache
cd platforms/android
./gradlew clean
./gradlew --stop
cd ../..

# Rebuild
cordova clean
cordova build android --release
```

### Notification tidak keluar di Android 13+

1. Check permission di `config.xml`:
```xml
<permission name="android.permission.POST_NOTIFICATIONS" />
```

2. Verify notification channel di app-level gradle:
```gradle
manifestPlaceholders = [
    notificationChannelId: "wemos_alarm_channel",
    notificationChannelName: "Wemos Alarm"
]
```

3. Check user permission grant saat runtime.

### Sound/Vibration tidak berfungsi

1. Pastikan file audio ada di `www/sounds/`
2. Check permission di config.xml:
```xml
<permission name="android.permission.VIBRATE" />
<permission name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

3. Set volume maksimal di `AlarmManager`:
```javascript
media.setVolume(1.0); // 100%
```

## GitHub Actions Build

APK otomatis dibangun saat push ke main/develop branch.

Artifacts tersedia di **Actions → Build Android APK** tab.

```yaml
# .github/workflows/build.yml configuration
- Trigger: push ke main, develop, atau manual via workflow_dispatch
- Build: Debug + Release APK
- Artifacts: disimpan 7 hari
- Requirements: Node 18+, Java 17, Android SDK 34
```

## Optimization Tips

### Reduce APK Size
```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
        }
    }
}
```

### Improve Build Speed
```properties
# gradle.properties
org.gradle.parallel=true
org.gradle.daemon=true
org.gradle.caching=true
org.gradle.configureondemand=true
```

### ProGuard Configuration
Edit `platforms/android/app/proguard-rules.pro` untuk exclude critical libs.

## Production Release Checklist

- [ ] Test pada device fisik (Android 13+)
- [ ] Verify alarm & notification berfungsi dengan layar terkunci
- [ ] Test WiFi connection & Wemos pairing
- [ ] Sign APK dengan keystore production
- [ ] Test ProGuard/R8 obfuscation
- [ ] Create GitHub release
- [ ] Update version di package.json & config.xml
- [ ] Document breaking changes

## Support

Untuk issues atau questions:
1. Check GitHub Issues
2. Review Cordova docs: https://cordova.apache.org/docs/
3. Check plugin docs pada masing-masing plugin

## References

- [Cordova Documentation](https://cordova.apache.org/)
- [Android Developers](https://developer.android.com/)
- [Gradle Build Tool](https://gradle.org/)
- [Local Notifications Plugin](https://github.com/katzer/cordova-plugin-local-notifications)
- [Wake Lock Plugin](https://github.com/Vad1mo/cordova-plugin-wakelock)
