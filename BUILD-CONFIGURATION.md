# Complete Build Configuration Guide

## 📦 All Configuration Files Created

Below are all the files that have been successfully created in your wemos-pro repository for Android APK building with alarm notifications.

---

## ✅ Files Successfully Created

### 1. **config.xml** ✓
- Location: `/config.xml`
- Purpose: Cordova main configuration
- Features:
  - Android 13+ support (API 34)
  - Alarm & notification permissions (POST_NOTIFICATIONS, WAKE_LOCK, VIBRATE)
  - All required plugins configured
  - Full-screen intent support

### 2. **package.json** ✓
- Location: `/package.json`
- Purpose: NPM dependencies and build scripts
- Key Scripts:
  - `npm run build` - Build release APK
  - `npm run build:debug` - Build debug APK
  - `npm run plugin:add:all` - Install all plugins
  - `npm run check:requirements` - Verify Android requirements

### 3. **README-BUILD.md** ✓
- Location: `/README-BUILD.md`
- Comprehensive build guide with:
  - Step-by-step installation instructions
  - Java 17 & Android SDK setup
  - Gradle configuration details
  - Troubleshooting guide
  - APK signing instructions

### 4. **platforms/android/build.gradle** ✓
- Location: `/platforms/android/build.gradle`
- Purpose: Project-level Gradle configuration
- Settings:
  - Gradle 7.6.2
  - Java 17 support
  - Google Services integration

### 5. **platforms/android/app/build.gradle** ✓
- Location: `/platforms/android/app/build.gradle`
- Purpose: App-level Gradle configuration
- Features:
  - API 34 (Android 13) targeting
  - Multi-DEX support
  - ProGuard/R8 obfuscation (release)
  - Notification channel configuration
  - AndroidX support

### 6. **platforms/android/gradle.properties** ✓
- Location: `/platforms/android/gradle.properties`
- Purpose: Gradle performance optimization
- Optimization:
  - 4GB JVM memory allocation
  - Parallel builds enabled
  - Gradle daemon enabled
  - Build caching enabled

### 7. **www/js/alarm-manager.js** ✓
- Location: `/www/js/alarm-manager.js`
- Purpose: JavaScript alarm notification handler
- Features:
  - Full-screen notifications
  - Wake lock management
  - Background mode support
  - Audio + vibration patterns
  - Snooze functionality
  - Alarm scheduling

### 8. **.gitignore** ✓
- Location: `/.gitignore`
- Purpose: Exclude build artifacts from version control
- Excludes: platforms/, plugins/, build outputs, node_modules/

---

## 📋 Still Need to Add

### **.github/workflows/build.yml** (Manual Addition Required)
Due to repository permissions, please create this file manually:

**Path:** `.github/workflows/build.yml`

```yaml
name: Build Android APK

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Setup Java
      uses: actions/setup-java@v4
      with:
        distribution: 'temurin'
        java-version: '17'
    
    - name: Setup Android SDK
      uses: android-actions/setup-android@v3
      with:
        api-level: 34
        build-tools-version: 34.0.0
        ndk-version: 25.1.8937393
    
    - name: Install Cordova CLI
      run: npm install -g cordova
    
    - name: Install dependencies
      run: npm ci
    
    - name: Add Android platform
      run: cordova platform add android@13.0.0
    
    - name: Install plugins
      run: npm run plugin:add:all
    
    - name: Build APK (Debug)
      run: npm run build:debug
    
    - name: Build APK (Release)
      run: npm run build
    
    - name: Upload APKs
      uses: actions/upload-artifact@v4
      with:
        name: apks
        path: platforms/android/app/build/outputs/apk/
        retention-days: 7
```

---

## 🚀 Quick Start Guide

### Step 1: Initial Setup

```bash
# Clone repository
git clone https://github.com/ncehah-boop/wemos-pro.git
cd wemos-pro

# Install Node dependencies
npm install

# Install Cordova globally
npm install -g cordova
```

### Step 2: Android Platform & Plugins

```bash
# Add Android platform
cordova platform add android@13.0.0

# Install all required plugins
npm run plugin:add:all

# Or install individually:
npm run plugin:add:notifications
npm run plugin:add:network
npm run plugin:add:audio
npm run plugin:add:storage
```

### Step 3: Verify Setup

```bash
# Check all requirements
npm run check:requirements

# Expected output should show ✓ for:
# - Java JDK 17
# - Android SDK API 34
# - Android Build Tools 34.0.0
# - Gradle 7.6.2
```

### Step 4: Build APK

#### Debug Build (for testing)
```bash
npm run build:debug
# Output: platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

#### Release Build (for production)
```bash
npm run build
# Output: platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### Step 5: Install on Device

```bash
# Via USB debug
adb devices
adb install -r platforms/android/app/build/outputs/apk/debug/app-debug.apk

# Or via Cordova
cordova run android
```

---

## 🔔 Alarm Notification Features

### JavaScript Implementation

The `alarm-manager.js` file provides complete alarm management:

```javascript
// Trigger alarm
await alarmManager.triggerAlarm({
    title: 'Wemos Alert',
    message: 'Temperature High!',
    alarmType: 'warning', // 'alarm' | 'warning' | 'notification'
    duration: 30, // seconds (0 = infinite)
    vibrate: true,
    wakeScreen: true,
    volume: 100 // 0-100
});

// Schedule alarm for specific time
await alarmManager.scheduleAlarm(new Date(Date.now() + 60000), {
    title: 'Scheduled Alarm',
    message: 'Time to check device'
});

// Snooze alarm 5 minutes
alarmManager.snoozeAlarm(alarmId, 5);

// Dismiss alarm
await alarmManager.dismissAlarm(alarmId);

// Get active alarms
const active = alarmManager.getActiveAlarms();
```

### Features Included

✅ **Full-Screen Notifications** - Shows even when screen is locked
✅ **Wake Lock** - Keeps device awake during alarm
✅ **Background Mode** - Continues running in background
✅ **Audio** - Plays alarm sound at max volume
✅ **Vibration** - SOS pattern or custom vibration
✅ **Snooze** - 5-minute snooze option
✅ **Persistent** - Notification stays until dismissed

---

## 📱 Integration with HTML

Add alarm-manager to your `www/index.html`:

```html
<!-- Before closing </body> tag -->
<script src="cordova.js"></script>
<script src="js/alarm-manager.js"></script>

<script>
    // Wait for Cordova ready
    document.addEventListener('deviceready', function() {
        // Alarm manager is automatically initialized
        
        // Listen for alarm status changes
        document.addEventListener('alarmStatusChange', (event) => {
            console.log('Alarm status:', event.detail);
        });
        
        // Test alarm
        document.getElementById('test-alarm-btn').addEventListener('click', () => {
            alarmManager.triggerAlarm({
                title: 'Test Alarm',
                message: 'This is a test alarm notification',
                alarmType: 'alarm',
                duration: 10
            });
        });
    }, false);
</script>
```

---

## 🔐 Security & Permissions

### Android Permissions (Auto-granted via config.xml)

```
POST_NOTIFICATIONS       - Send notifications (Android 13+)
DISABLE_KEYGUARD        - Bypass lock screen
WAKE_LOCK               - Keep device awake
VIBRATE                 - Vibration control
SCHEDULE_EXACT_ALARM    - Exact alarm scheduling
INTERNET                - Network communication
MODIFY_AUDIO_SETTINGS   - Audio control
```

### Runtime Permissions (Android 13+)

For `POST_NOTIFICATIONS`, add runtime permission check:

```javascript
// In alarm-manager.js (already handled)
// The local-notifications plugin handles this automatically
```

---

## 🛠️ Troubleshooting

### Build Fails: "Build tools version not found"

```bash
# Download required build tools
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "build-tools;34.0.0"

# Or set environment
export ANDROID_HOME=$HOME/Android/Sdk
```

### Java version mismatch

```bash
# Check Java version
java -version

# Should show: openjdk version "17.x.x"

# If not, set JAVA_HOME
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
```

### Notification not showing

1. Verify `android.permission.POST_NOTIFICATIONS` in config.xml
2. Check `notificationChannelId` matches in build.gradle
3. Ensure app has notification permission granted
4. Check Android version >= 13 for new permission requirement

### Sound/Vibration not working

1. Place audio files in `www/sounds/` directory
2. Verify VIBRATE and MODIFY_AUDIO_SETTINGS permissions
3. Check volume settings - ensure not in silent mode
4. Test with maximum volume (100)

---

## 📊 Build Statistics

| Component | Version | Purpose |
|-----------|---------|---------|
| Java | 17 | Compilation |
| Gradle | 7.6.2 | Build system |
| Android SDK | 34 | Target API level |
| Build Tools | 34.0.0 | Compilation tools |
| Cordova | 12.0.0 | Framework |
| Node | 18+ | Development |
| npm | 9+ | Package management |

---

## 📞 Support & Documentation

### Cordova Plugins Used

- **cordova-plugin-local-notifications** - Full-screen notifications
- **cordova-plugin-wake-lock** - Keep screen awake
- **cordova-plugin-background-mode** - Background execution
- **cordova-plugin-vibration** - Vibration control
- **cordova-plugin-media** - Audio playback
- **cordova-plugin-wifiwizard2** - WiFi management

### Official Resources

- [Cordova Documentation](https://cordova.apache.org/docs/)
- [Android Developers](https://developer.android.com/)
- [Gradle Build Tool](https://gradle.org/)

---

## ✨ Next Steps

1. ✅ Verify all config files are in place
2. ✅ Add `.github/workflows/build.yml` manually
3. ✅ Run `npm install` to install dependencies
4. ✅ Run `npm run check:requirements` to verify setup
5. ✅ Build first debug APK: `npm run build:debug`
6. ✅ Test on device with alarm notifications
7. ✅ Create keystore for production: `keytool -genkey -v -keystore my-key.keystore ...`
8. ✅ Sign release APK and upload to Play Store

---

**Created:** 2024
**Project:** Wemos D1 Pro - Smart Device Controller
**Author:** Wemos Development Team
