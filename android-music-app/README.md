# Retro Music Player for Android

A feature-rich Android music player with a retro 80s/90s aesthetic theme. Play local music files with stunning visualizers, audio effects, and a fully customizable equalizer.

## Features

### Core Functionality
- **Local Music Playback**: Browse and play all music files stored on your device
- **Background Playback**: Music continues playing when app is in background
- **Playlist Management**: Play, pause, skip, shuffle, and repeat
- **Foreground Service**: Persistent notification with playback controls

### Visual Experience
- **Retro Theme**: Purple, cyan, and pink color scheme inspired by the 80s/90s
- **Multiple Visualizers**:
  - Waveform - Classic oscilloscope-style visualization
  - Spectrum - Frequency spectrum analyzer
  - Circular - Radial waveform visualization
  - Bars - Colorful frequency bars
- **Real-time Animation**: Visualizers sync perfectly with audio playback

### Audio Enhancement
- **Equalizer**:
  - 7 preset modes (Normal, Rock, Jazz, Pop, Classical, Bass Boost, Treble Boost)
  - Multi-band frequency control
  - Enable/disable on the fly
- **Bass Boost**: Enhanced low-frequency response
- **Virtualizer**: 3D surround sound effect
- **Reverb Effects**:
  - Small Room
  - Medium Room
  - Large Room
  - Medium Hall
  - Large Hall
  - Plate Reverb

### Monetization
- **Ad Banner**: Integrated AdMob ad space at the top (placeholder included)

## Tech Stack

- **Language**: Kotlin
- **Architecture**: Service-based architecture with foreground service
- **Audio APIs**:
  - MediaPlayer for playback
  - Visualizer API for audio visualization
  - Equalizer API for frequency control
  - BassBoost, Virtualizer, PresetReverb for audio effects
- **UI**: Material Design with custom retro styling
- **Ads**: Google AdMob integration ready

## Project Structure

```
android-music-app/
├── app/
│   ├── src/main/
│   │   ├── java/com/retro/musicplayer/
│   │   │   ├── MainActivity.kt              # Main UI and user interactions
│   │   │   ├── Song.kt                      # Song data model
│   │   │   ├── MusicRepository.kt           # Music file scanning
│   │   │   ├── adapter/
│   │   │   │   └── SongAdapter.kt           # RecyclerView adapter
│   │   │   ├── service/
│   │   │   │   └── MusicService.kt          # Background playback service
│   │   │   ├── view/
│   │   │   │   └── VisualizerView.kt        # Custom visualizer view
│   │   │   └── effects/
│   │   │       └── AudioEffectsManager.kt   # Audio effects controller
│   │   ├── res/
│   │   │   ├── layout/
│   │   │   │   ├── activity_main.xml        # Main screen layout
│   │   │   │   └── item_song.xml            # Song list item layout
│   │   │   ├── values/
│   │   │   │   ├── colors.xml               # Retro color palette
│   │   │   │   ├── strings.xml              # App strings
│   │   │   │   └── themes.xml               # Retro theme definition
│   │   │   └── drawable/                    # Icons and graphics
│   │   └── AndroidManifest.xml
│   └── build.gradle
├── build.gradle
├── settings.gradle
└── README.md
```

## Setup Instructions

### Prerequisites
- Android Studio Arctic Fox or later
- Android SDK 24 (Android 7.0) or higher
- Physical Android device or emulator

### Installation

1. **Open in Android Studio**
   ```bash
   cd android-music-app
   # Open the folder in Android Studio
   ```

2. **Sync Gradle**
   - Android Studio will automatically detect the project
   - Click "Sync Now" when prompted

3. **Configure AdMob (Optional)**
   - In `AndroidManifest.xml`, replace the test AdMob app ID with your production ID:
     ```xml
     <meta-data
         android:name="com.google.android.gms.ads.APPLICATION_ID"
         android:value="YOUR_ADMOB_APP_ID"/>
     ```

4. **Build and Run**
   - Connect an Android device or start an emulator
   - Click "Run" (green play button) in Android Studio
   - Grant permissions when prompted

### Required Permissions

The app requests the following permissions:
- **Storage**: To read music files from device storage
  - `READ_EXTERNAL_STORAGE` (Android 12 and below)
  - `READ_MEDIA_AUDIO` (Android 13+)
- **Audio Recording**: For visualizer (doesn't actually record)
  - `RECORD_AUDIO`
- **Internet**: For displaying ads
  - `INTERNET`
  - `ACCESS_NETWORK_STATE`

## Usage Guide

### Playing Music

1. **Grant Permissions**: Allow storage and audio permissions when prompted
2. **Select Song**: Tap any song from the list to play
3. **Playback Controls**:
   - Play/Pause button (center pink button)
   - Previous/Next buttons
   - Shuffle and Repeat toggles
4. **Seek**: Drag the seekbar to jump to any position

### Changing Visualizer

1. Tap the **VISUALIZER** button
2. Choose from:
   - Waveform
   - Spectrum
   - Circular
   - Bars
3. The visualizer updates in real-time

### Using Equalizer

1. Tap the **EQUALIZER** button
2. Select a preset:
   - Normal (flat response)
   - Rock
   - Jazz
   - Pop
   - Classical
   - Bass Boost
   - Treble Boost
3. Tap "OFF" to disable

### Applying Audio Effects

1. Tap the **AUDIO EFFECTS** button
2. Choose an effect:
   - **Bass Boost**: Enhances bass frequencies
   - **Virtualizer (3D)**: Creates surround sound
   - **Reverb - Small Room**: Intimate reverb
   - **Reverb - Large Hall**: Spacious reverb
3. Effects can be combined
4. Tap "CLEAR ALL" to remove all effects

## Customization

### Changing Colors

Edit `app/src/main/res/values/colors.xml`:
```xml
<color name="retro_purple">#9D4EDD</color>
<color name="retro_pink">#FF006E</color>
<color name="retro_cyan">#00F5FF</color>
```

### Modifying Visualizer

The `VisualizerView.kt` class contains drawing logic for each visualizer type. Customize the `onDraw()` method to create your own visualizations.

### Adding Equalizer Presets

In `MainActivity.kt`, add more presets to the `showEqualizerDialog()` method and use `effects.setEqualizerPreset()`.

## Building for Release

1. **Generate Keystore**:
   ```bash
   keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias
   ```

2. **Configure Signing** in `app/build.gradle`:
   ```gradle
   signingConfigs {
       release {
           storeFile file("my-release-key.jks")
           storePassword "password"
           keyAlias "my-alias"
           keyPassword "password"
       }
   }
   ```

3. **Build APK**:
   ```bash
   ./gradlew assembleRelease
   ```

## Performance Considerations

- Visualizer is GPU-accelerated for smooth animations
- Audio effects are hardware-accelerated when available
- Service runs in foreground to prevent being killed
- Efficient memory usage with recycled views

## Troubleshooting

### No Songs Found
- Ensure music files are in standard locations (Music, Downloads folders)
- Check storage permissions are granted
- Supported formats: MP3, M4A, OGG, WAV, FLAC

### Visualizer Not Working
- Grant RECORD_AUDIO permission
- Some emulators don't support visualizer - test on physical device
- Visualizer requires active audio playback

### Effects Not Applied
- Effects require a valid audio session
- Restart playback if effects don't apply
- Some devices have limited audio effect support

### App Crashes on Startup
- Check all permissions are granted
- Verify Android version is 7.0 (API 24) or higher
- Check logcat for specific error messages

## Future Enhancements

- [ ] Custom playlists
- [ ] Song search and filtering
- [ ] Album art display
- [ ] Lock screen controls
- [ ] Sleep timer
- [ ] Custom equalizer bands
- [ ] Audio file metadata editing
- [ ] Theme customization options
- [ ] Lyrics display
- [ ] Chromecast support

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## Credits

Built with Android's powerful audio APIs:
- MediaPlayer
- Visualizer
- Equalizer
- AudioEffect

Designed with Material Design components and a retro aesthetic inspired by 80s/90s music equipment.
