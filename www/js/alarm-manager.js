/**
 * Alarm Manager - Menangani alarm dan notifikasi yang dapat membangunkan ponsel
 * Kompatibel dengan Cordova plugins: local-notifications, wake-lock, background-mode
 */

class AlarmManager {
    constructor() {
        this.isInitialized = false;
        this.activeAlarms = new Map();
        this.notificationId = 0;
        this.soundPath = null;
        this.isBackgroundModeEnabled = false;
        
        this.init();
    }

    async init() {
        if (this.isInitialized) return;

        try {
            // Tunggu Cordova ready
            await this.waitForCordova();

            // Initialize plugins
            this.initializePlugins();
            this.setupEventListeners();
            this.isInitialized = true;

            console.log('[AlarmManager] Initialized successfully');
        } catch (error) {
            console.error('[AlarmManager] Initialization error:', error);
        }
    }

    waitForCordova() {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (window.cordova && window.cordova.plugins) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);

            setTimeout(() => {
                clearInterval(interval);
                resolve();
            }, 5000);
        });
    }

    initializePlugins() {
        // Initialize Local Notifications
        if (cordova && cordova.plugins && cordova.plugins.notification) {
            console.log('[AlarmManager] Local Notifications plugin ready');
        }

        // Initialize Wake Lock
        if (cordova && cordova.plugins && cordova.plugins.wakeLock) {
            console.log('[AlarmManager] Wake Lock plugin ready');
        }

        // Initialize Background Mode
        if (cordova && cordova.plugins && cordova.plugins.backgroundMode) {
            console.log('[AlarmManager] Background Mode plugin ready');
        }
    }

    setupEventListeners() {
        // Listen untuk notification clicks
        if (cordova && cordova.plugins && cordova.plugins.notification && cordova.plugins.notification.local) {
            cordova.plugins.notification.local.on('click', (notification) => {
                this.handleNotificationClick(notification);
            });

            cordova.plugins.notification.local.on('trigger', (notification) => {
                this.handleNotificationTrigger(notification);
            });
        }
    }

    /**
     * Trigger alarm dengan full features
     * @param {Object} config - Konfigurasi alarm
     * @param {string} config.title - Judul alarm
     * @param {string} config.message - Pesan alarm
     * @param {string} config.alarmType - Tipe alarm: 'alarm' | 'notification' | 'warning'
     * @param {number} config.duration - Durasi alarm dalam detik (0 = infinite)
     * @param {boolean} config.vibrate - Aktifkan vibration
     * @param {boolean} config.wakeScreen - Bangunkan layar
     * @param {number} config.volume - Volume 0-100
     */
    async triggerAlarm(config = {}) {
        const {
            title = 'Wemos Alarm',
            message = 'Alarm triggered',
            alarmType = 'alarm',
            duration = 30,
            vibrate = true,
            wakeScreen = true,
            volume = 100
        } = config;

        const alarmId = Date.now();

        try {
            // 1. Enable wake lock untuk menjaga layar tetap hidup
            if (wakeScreen) {
                await this.enableWakeLock();
            }

            // 2. Enable background mode
            await this.enableBackgroundMode();

            // 3. Show full-screen notification
            await this.showFullScreenNotification({
                id: alarmId,
                title,
                message,
                alarmType,
                vibrate,
                volume
            });

            // 4. Vibrate pattern
            if (vibrate) {
                this.vibratePattern(alarmType);
            }

            // 5. Play alarm sound
            await this.playAlarmSound(alarmType, volume);

            // 6. Auto-dismiss setelah duration
            if (duration > 0) {
                setTimeout(() => {
                    this.dismissAlarm(alarmId);
                }, duration * 1000);
            }

            // Store alarm reference
            this.activeAlarms.set(alarmId, {
                title,
                message,
                alarmType,
                startTime: Date.now(),
                duration
            });

            // Update UI
            this.updateAlarmUI(alarmId, true);

            return alarmId;
        } catch (error) {
            console.error('[AlarmManager] Error triggering alarm:', error);
            throw error;
        }
    }

    /**
     * Show full-screen notification (menggunakan Local Notifications)
     */
    async showFullScreenNotification(config) {
        return new Promise((resolve, reject) => {
            if (!cordova || !cordova.plugins || !cordova.plugins.notification || !cordova.plugins.notification.local) {
                console.warn('[AlarmManager] Local Notifications plugin not available');
                resolve();
                return;
            }

            const notification = {
                id: config.id,
                title: config.title,
                text: config.message,
                foreground: true,
                bigText: config.message,
                autoCancel: false,
                priority: 2, // MAX priority
                sound: null, // Sound dihandle terpisah
                vibrate: config.vibrate ? [100, 200, 100, 200] : false,
                led: 'FF0000FF', // Red LED
                ongoing: true, // Persistent notification
                actions: [
                    { id: 'dismiss', title: 'Dismiss' },
                    { id: 'snooze', title: 'Snooze 5min' }
                ]
            };

            // For full screen intent (requires SCHEDULE_EXACT_ALARM permission)
            if (cordova.platformId === 'android') {
                notification.channelId = 'wemos_alarm_channel';
                notification.importance = 5; // MAX importance
            }

            cordova.plugins.notification.local.schedule(notification, () => {
                resolve();
            }, (error) => {
                reject(error);
            });
        });
    }

    /**
     * Play alarm sound
     */
    async playAlarmSound(alarmType = 'alarm', volume = 100) {
        return new Promise((resolve) => {
            if (!cordova || !cordova.plugins || !cordova.plugins.media) {
                console.warn('[AlarmManager] Media plugin not available');
                resolve();
                return;
            }

            // Determine sound file based on alarm type
            let soundFile = 'sounds/alarm-default.mp3';
            if (alarmType === 'warning') {
                soundFile = 'sounds/alarm-warning.mp3';
            } else if (alarmType === 'notification') {
                soundFile = 'sounds/notification.mp3';
            }

            try {
                // Try to play from assets
                const media = new Media(
                    soundFile,
                    () => {
                        console.log('[AlarmManager] Sound played successfully');
                        // Loop sound if needed
                        this.audioMedia = media;
                        resolve();
                    },
                    (error) => {
                        console.warn('[AlarmManager] Error playing sound:', error);
                        resolve();
                    }
                );

                // Set volume
                media.setVolume(volume / 100);
                media.play();
            } catch (error) {
                console.error('[AlarmManager] Media playback error:', error);
                resolve();
            }
        });
    }

    /**
     * Vibrate pattern berdasarkan alarm type
     */
    vibratePattern(alarmType = 'alarm') {
        if (!navigator || !navigator.vibrate) {
            return;
        }

        let pattern;
        switch (alarmType) {
            case 'alarm':
                pattern = [200, 300, 200, 300, 200, 300]; // SOS pattern
                break;
            case 'warning':
                pattern = [100, 100, 100, 100, 100, 200];
                break;
            case 'notification':
                pattern = [50, 100, 50];
                break;
            default:
                pattern = [200, 100, 200];
        }

        navigator.vibrate(pattern);
    }

    /**
     * Enable wake lock untuk menjaga layar tetap hidup
     */
    async enableWakeLock() {
        return new Promise((resolve) => {
            if (!cordova || !cordova.plugins || !cordova.plugins.wakeLock) {
                console.warn('[AlarmManager] WakeLock plugin not available');
                resolve();
                return;
            }

            cordova.plugins.wakeLock.acquire(() => {
                console.log('[AlarmManager] Wake lock acquired');
                resolve();
            }, (error) => {
                console.warn('[AlarmManager] Wake lock error:', error);
                resolve();
            });
        });
    }

    /**
     * Disable wake lock
     */
    async disableWakeLock() {
        return new Promise((resolve) => {
            if (!cordova || !cordova.plugins || !cordova.plugins.wakeLock) {
                resolve();
                return;
            }

            cordova.plugins.wakeLock.release(() => {
                console.log('[AlarmManager] Wake lock released');
                resolve();
            }, () => {
                resolve();
            });
        });
    }

    /**
     * Enable background mode
     */
    async enableBackgroundMode() {
        return new Promise((resolve) => {
            if (!cordova || !cordova.plugins || !cordova.plugins.backgroundMode) {
                console.warn('[AlarmManager] Background Mode plugin not available');
                resolve();
                return;
            }

            if (this.isBackgroundModeEnabled) {
                resolve();
                return;
            }

            cordova.plugins.backgroundMode.enable();
            cordova.plugins.backgroundMode.setDefaults({
                title: 'Wemos D1 Pro',
                ticker: 'Running in background',
                text: 'Monitoring Wemos device...',
                bigText: true
            });

            this.isBackgroundModeEnabled = true;
            console.log('[AlarmManager] Background mode enabled');
            resolve();
        });
    }

    /**
     * Dismiss alarm
     */
    async dismissAlarm(alarmId) {
        try {
            // Cancel notification
            if (cordova && cordova.plugins && cordova.plugins.notification && cordova.plugins.notification.local) {
                cordova.plugins.notification.local.cancel(alarmId);
            }

            // Stop audio
            if (this.audioMedia) {
                this.audioMedia.stop();
                this.audioMedia.release();
                this.audioMedia = null;
            }

            // Release wake lock
            await this.disableWakeLock();

            // Remove from active alarms
            this.activeAlarms.delete(alarmId);

            // Update UI
            this.updateAlarmUI(alarmId, false);

            console.log('[AlarmManager] Alarm dismissed:', alarmId);
        } catch (error) {
            console.error('[AlarmManager] Error dismissing alarm:', error);
        }
    }

    /**
     * Schedule alarm untuk waktu tertentu
     */
    scheduleAlarm(time, config = {}) {
        return new Promise((resolve, reject) => {
            if (!cordova || !cordova.plugins || !cordova.plugins.notification || !cordova.plugins.notification.local) {
                reject(new Error('Local Notifications plugin not available'));
                return;
            }

            const notification = {
                id: Date.now(),
                title: config.title || 'Scheduled Alarm',
                text: config.message || 'Alarm',
                trigger: { at: new Date(time) },
                autoCancel: false,
                ongoing: true
            };

            cordova.plugins.notification.local.schedule(notification, () => {
                resolve(notification.id);
            }, (error) => {
                reject(error);
            });
        });
    }

    /**
     * Handle notification click
     */
    handleNotificationClick(notification) {
        console.log('[AlarmManager] Notification clicked:', notification);

        const alarmId = notification.id;

        if (notification.action === 'dismiss') {
            this.dismissAlarm(alarmId);
        } else if (notification.action === 'snooze') {
            this.snoozeAlarm(alarmId, 5); // Snooze 5 menit
        }
    }

    /**
     * Handle notification trigger
     */
    handleNotificationTrigger(notification) {
        console.log('[AlarmManager] Notification triggered:', notification);
        // Alarm sudah ditrigger, play sound dan vibrate
        this.playAlarmSound('alarm', 100);
        this.vibratePattern('alarm');
    }

    /**
     * Snooze alarm
     */
    snoozeAlarm(alarmId, minutesToSnooze = 5) {
        this.dismissAlarm(alarmId);

        // Schedule ulang untuk N menit kemudian
        const snoozeTime = new Date(Date.now() + minutesToSnooze * 60000);
        
        const alarm = this.activeAlarms.get(alarmId);
        if (alarm) {
            this.scheduleAlarm(snoozeTime, {
                title: alarm.title,
                message: `${alarm.message} (snoozed)`
            });
        }

        console.log('[AlarmManager] Alarm snoozed for', minutesToSnooze, 'minutes');
    }

    /**
     * Update UI alarm status
     */
    updateAlarmUI(alarmId, isActive) {
        // Dispatch event untuk UI update
        const event = new CustomEvent('alarmStatusChange', {
            detail: {
                alarmId,
                isActive
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Get active alarms
     */
    getActiveAlarms() {
        return Array.from(this.activeAlarms.entries()).map(([id, config]) => ({
            id,
            ...config
        }));
    }

    /**
     * Clear all alarms
     */
    async clearAllAlarms() {
        for (const [alarmId] of this.activeAlarms) {
            await this.dismissAlarm(alarmId);
        }
    }
}

// Initialize on DOM ready
const alarmManager = new AlarmManager();

// Export for global use
window.AlarmManager = AlarmManager;
window.alarmManager = alarmManager;
