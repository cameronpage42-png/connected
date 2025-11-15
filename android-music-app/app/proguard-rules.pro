# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Keep data classes
-keep class com.retro.musicplayer.Song { *; }

# Keep service
-keep class com.retro.musicplayer.service.** { *; }

# AdMob
-keep public class com.google.android.gms.ads.** {
   public *;
}

# Keep audio effects
-keep class android.media.audiofx.** { *; }
