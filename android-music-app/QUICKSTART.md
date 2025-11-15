# Quick Start Guide - Retro Music Player

## For Developers

### 1. Open Project in Android Studio

```bash
# Navigate to the project
cd android-music-app

# Open in Android Studio
# File > Open > Select android-music-app folder
```

### 2. First Build

1. Android Studio will prompt to sync Gradle - click **Sync Now**
2. Wait for dependencies to download (first time may take a few minutes)
3. Build > Make Project (or Ctrl+F9 / Cmd+F9)

### 3. Run on Device/Emulator

**Option A: Physical Device**
- Enable Developer Options on your Android phone
- Enable USB Debugging
- Connect via USB
- Click Run (green play button)

**Option B: Emulator**
- Tools > Device Manager
- Create a new device (Pixel 5 recommended)
- Select Android 11 (API 30) or higher
- Click Run > Select your emulator

### 4. Grant Permissions

When the app launches:
1. Tap "Allow" for storage permission
2. Tap "Allow" for audio recording permission (needed for visualizer)

### 5. Test Features

The app will automatically scan for music files. If no music is found:

**Add Test Music to Emulator:**
```bash
# Push a music file to emulator
adb push your-music-file.mp3 /sdcard/Music/
```

**On Physical Device:**
- Ensure you have MP3 files in your Music or Downloads folder

## Key Features to Test

### Playback
- ✅ Tap any song to play
- ✅ Use play/pause, next, previous buttons
- ✅ Try shuffle and repeat modes
- ✅ Drag seekbar to change position

### Visualizers
- ✅ Tap **VISUALIZER** button
- ✅ Try all 4 types: Waveform, Spectrum, Circular, Bars
- ✅ Watch them animate with the music

### Equalizer
- ✅ Tap **EQUALIZER** button
- ✅ Select different presets (Rock, Jazz, Pop, etc.)
- ✅ Notice the audio quality change

### Audio Effects
- ✅ Tap **AUDIO EFFECTS** button
- ✅ Try Bass Boost (great for hip-hop)
- ✅ Try Virtualizer for 3D sound
- ✅ Try different reverb settings
- ✅ Combine multiple effects

## Common Issues

### "No songs found"
- Add music files to `/sdcard/Music/` or `/sdcard/Download/`
- Re-launch the app to rescan

### Visualizer not animating
- Make sure audio permission is granted
- Ensure music is actually playing
- Try on a physical device (emulators may not support it)

### Build errors
```bash
# Clean and rebuild
./gradlew clean
./gradlew build
```

### Permission errors
- Go to Settings > Apps > Retro Music Player > Permissions
- Enable all permissions manually

## Customization Quick Tips

### Change Theme Colors
Edit `app/src/main/res/values/colors.xml`

### Modify Visualizer
Edit `app/src/main/java/com/retro/musicplayer/view/VisualizerView.kt`

### Add More Effects
Edit `showEffectsDialog()` in `MainActivity.kt`

## Building Release APK

```bash
# From project root
./gradlew assembleRelease

# APK will be at:
# app/build/outputs/apk/release/app-release-unsigned.apk
```

## Next Steps

1. ⭐ Star the repository
2. 📝 Read the full README.md
3. 🎨 Customize the theme
4. 🚀 Add your own features
5. 📱 Deploy to Google Play Store

## Support

- Issues: Open a GitHub issue
- Questions: Check README.md FAQ
- Contributions: Submit a pull request

Enjoy your retro music experience! 🎵✨
