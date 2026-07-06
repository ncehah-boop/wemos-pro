# ProGuard rules for Cordova and Wemos Pro app

# Keep Cordova framework
-keep class org.apache.cordova.** { *; }
-keep class org.apache.cordova.engine.** { *; }
-keep class org.apache.cordova.plugin.** { *; }

# Keep all Cordova plugin classes
-keep class cordova.** { *; }
-keep interface cordova.** { *; }

# Keep local notifications plugin
-keep class de.appplant.cordova.plugin.notification.** { *; }
-keep interface de.appplant.cordova.plugin.notification.** { *; }

# Keep wake lock plugin
-keep class nl.shortstop.cordova.plugin.** { *; }

# Keep background mode plugin
-keep class com.tenforwardconsulting.cordova.bgloc.** { *; }

# Keep vibration plugin
-keep class org.apache.cordova.vibration.** { *; }

# Keep media plugin
-keep class org.apache.cordova.media.** { *; }

# Keep file plugin
-keep class org.apache.cordova.file.** { *; }

# Keep network plugin
-keep class org.apache.cordova.network.Connection { *; }

# Keep our custom alarm manager
-keep class AlarmManager { *; }
-keepclassmembers class AlarmManager { *; }

# Keep all native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Parcelable implementations
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep Serializable implementations
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep Android framework classes
-keep class android.** { *; }
-keep interface android.** { *; }

# Keep AndroidX
-keep class androidx.** { *; }
-keep interface androidx.** { *; }

# Keep Google Play Services
-keep class com.google.android.gms.** { *; }
-keep interface com.google.android.gms.** { *; }
-keep class com.google.android.material.** { *; }

# Remove logging in release builds
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Optimization settings
-optimizationpasses 5
-dontusemixedcaseclassnames
-verbose

# Keep line numbers for crash reporting
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Preserve all public classes and methods
-keepclasseswithmembers public class * {
    public <methods>;
    public <fields>;
}

# Preserve annotations
-keepattributes *Annotation*
-keepattributes InnerClasses

# Keep R classes
-keep class **.R
-keep class **.R$* {
    <fields>;
}

# Keep BuildConfig
-keep class **.BuildConfig { *; }

# Preserve stack traces for debugging
-keepattributes EnclosingMethod
