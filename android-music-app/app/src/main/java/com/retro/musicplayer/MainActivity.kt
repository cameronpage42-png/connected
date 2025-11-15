package com.retro.musicplayer

import android.Manifest
import android.content.ComponentName
import android.content.Intent
import android.content.ServiceConnection
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.widget.SeekBar
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.MobileAds
import com.retro.musicplayer.adapter.SongAdapter
import com.retro.musicplayer.databinding.ActivityMainBinding
import com.retro.musicplayer.effects.AudioEffectsManager
import com.retro.musicplayer.service.MusicService
import com.retro.musicplayer.view.VisualizerView
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var musicService: MusicService? = null
    private var isBound = false
    private lateinit var repository: MusicRepository
    private lateinit var songAdapter: SongAdapter
    private var songs: List<Song> = emptyList()
    private var audioEffectsManager: AudioEffectsManager? = null

    private val updateHandler = Handler(Looper.getMainLooper())
    private val updateRunnable = object : Runnable {
        override fun run() {
            updateProgress()
            updateHandler.postDelayed(this, 1000)
        }
    }

    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as MusicService.MusicBinder
            musicService = binder.getService()
            isBound = true

            musicService?.setOnPlaybackStateChangedListener { isPlaying ->
                updatePlayPauseButton(isPlaying)
            }

            musicService?.setOnSongChangedListener { song ->
                updateNowPlaying(song)
            }

            // Initialize audio effects
            musicService?.getAudioSessionId()?.let { sessionId ->
                audioEffectsManager = AudioEffectsManager(sessionId)
                binding.visualizerView.setAudioSessionId(sessionId)
            }
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            musicService = null
            isBound = false
        }
    }

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val allGranted = permissions.values.all { it }
        if (allGranted) {
            loadSongs()
        } else {
            Toast.makeText(this, R.string.permission_storage, Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        repository = MusicRepository(this)
        setupRecyclerView()
        setupControls()
        setupAds()
        requestPermissions()

        // Bind to music service
        Intent(this, MusicService::class.java).also { intent ->
            bindService(intent, serviceConnection, BIND_AUTO_CREATE)
        }

        updateHandler.post(updateRunnable)
    }

    private fun setupAds() {
        MobileAds.initialize(this) {}
        // Note: In production, you would add AdMob AdView here
        // For now, we're using a placeholder in the layout
    }

    private fun setupRecyclerView() {
        songAdapter = SongAdapter(emptyList()) { song, position ->
            playSong(song, position)
        }

        binding.songListRecyclerView.apply {
            layoutManager = LinearLayoutManager(this@MainActivity)
            adapter = songAdapter
        }
    }

    private fun setupControls() {
        binding.btnPlayPause.setOnClickListener {
            if (musicService?.isPlaying() == true) {
                musicService?.pause()
            } else {
                musicService?.play()
            }
        }

        binding.btnNext.setOnClickListener {
            musicService?.playNext()
        }

        binding.btnPrevious.setOnClickListener {
            musicService?.playPrevious()
        }

        binding.btnShuffle.setOnClickListener {
            val isEnabled = musicService?.toggleShuffle() ?: false
            binding.btnShuffle.alpha = if (isEnabled) 1.0f else 0.5f
        }

        binding.btnRepeat.setOnClickListener {
            val mode = musicService?.toggleRepeat() ?: 0
            binding.btnRepeat.alpha = if (mode > 0) 1.0f else 0.5f
        }

        binding.seekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                if (fromUser) {
                    musicService?.seekTo(progress)
                }
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })

        binding.btnVisualizer.setOnClickListener {
            showVisualizerDialog()
        }

        binding.btnEqualizer.setOnClickListener {
            showEqualizerDialog()
        }

        binding.btnEffects.setOnClickListener {
            showEffectsDialog()
        }
    }

    private fun requestPermissions() {
        val permissions = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            arrayOf(
                Manifest.permission.READ_MEDIA_AUDIO,
                Manifest.permission.RECORD_AUDIO
            )
        } else {
            arrayOf(
                Manifest.permission.READ_EXTERNAL_STORAGE,
                Manifest.permission.RECORD_AUDIO
            )
        }

        val needsPermission = permissions.any {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (needsPermission) {
            permissionLauncher.launch(permissions)
        } else {
            loadSongs()
        }
    }

    private fun loadSongs() {
        lifecycleScope.launch {
            songs = repository.getAllSongs()
            songAdapter.updateSongs(songs)

            if (songs.isNotEmpty()) {
                musicService?.setPlaylist(songs, 0)
            }
        }
    }

    private fun playSong(song: Song, position: Int) {
        musicService?.setPlaylist(songs, position)
        songAdapter.setCurrentPlayingPosition(position)
    }

    private fun updatePlayPauseButton(isPlaying: Boolean) {
        binding.btnPlayPause.setImageResource(
            if (isPlaying) R.drawable.ic_pause else R.drawable.ic_play
        )
    }

    private fun updateNowPlaying(song: Song?) {
        song?.let {
            binding.songTitle.text = it.title
            binding.songArtist.text = it.artist
            binding.totalTime.text = it.getDurationString()
            binding.seekBar.max = it.duration.toInt()
        }
    }

    private fun updateProgress() {
        musicService?.let { service ->
            val currentPos = service.getCurrentPosition()
            val duration = service.getDuration()

            binding.seekBar.progress = currentPos
            binding.currentTime.text = formatTime(currentPos)

            if (duration > 0) {
                binding.totalTime.text = formatTime(duration)
            }
        }
    }

    private fun formatTime(milliseconds: Int): String {
        val minutes = milliseconds / 1000 / 60
        val seconds = milliseconds / 1000 % 60
        return String.format("%d:%02d", minutes, seconds)
    }

    private fun showVisualizerDialog() {
        val types = arrayOf("Waveform", "Spectrum", "Circular", "Bars")
        AlertDialog.Builder(this)
            .setTitle(R.string.visualizer)
            .setItems(types) { _, which ->
                val type = when (which) {
                    0 -> VisualizerView.VisualizerType.WAVEFORM
                    1 -> VisualizerView.VisualizerType.SPECTRUM
                    2 -> VisualizerView.VisualizerType.CIRCULAR
                    else -> VisualizerView.VisualizerType.BARS
                }
                binding.visualizerView.setVisualizerType(type)
            }
            .show()
    }

    private fun showEqualizerDialog() {
        audioEffectsManager?.let { effects ->
            val presets = arrayOf("Normal", "Rock", "Jazz", "Pop", "Classical", "Bass Boost", "Treble Boost")

            AlertDialog.Builder(this)
                .setTitle(R.string.equalizer)
                .setItems(presets) { _, which ->
                    effects.enableEqualizer(true)
                    when (which) {
                        0 -> effects.setEqualizerPreset(0)
                        1 -> effects.setEqualizerPreset(1)
                        2 -> effects.setEqualizerPreset(2)
                        3 -> effects.setEqualizerPreset(3)
                        4 -> effects.setEqualizerPreset(4)
                        5 -> effects.setEqualizerPreset(5)
                        6 -> effects.setEqualizerPreset(6)
                    }
                    Toast.makeText(this, "Equalizer preset applied", Toast.LENGTH_SHORT).show()
                }
                .setNegativeButton("Off") { _, _ ->
                    effects.enableEqualizer(false)
                }
                .show()
        } ?: Toast.makeText(this, "Equalizer not available", Toast.LENGTH_SHORT).show()
    }

    private fun showEffectsDialog() {
        audioEffectsManager?.let { effects ->
            val effectsArray = arrayOf("Bass Boost", "Virtualizer (3D)", "Reverb - Small Room", "Reverb - Large Hall")

            AlertDialog.Builder(this)
                .setTitle(R.string.audio_effects)
                .setItems(effectsArray) { _, which ->
                    when (which) {
                        0 -> {
                            effects.enableBassBoost(true)
                            effects.setBassBoostStrength(800)
                            Toast.makeText(this, "Bass Boost enabled", Toast.LENGTH_SHORT).show()
                        }
                        1 -> {
                            effects.enableVirtualizer(true)
                            effects.setVirtualizerStrength(800)
                            Toast.makeText(this, "3D effect enabled", Toast.LENGTH_SHORT).show()
                        }
                        2 -> {
                            effects.enableReverb(true)
                            effects.setReverbPreset(AudioEffectsManager.REVERB_SMALLROOM)
                            Toast.makeText(this, "Small room reverb enabled", Toast.LENGTH_SHORT).show()
                        }
                        3 -> {
                            effects.enableReverb(true)
                            effects.setReverbPreset(AudioEffectsManager.REVERB_LARGEHALL)
                            Toast.makeText(this, "Large hall reverb enabled", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
                .setNegativeButton("Clear All") { _, _ ->
                    effects.enableBassBoost(false)
                    effects.enableVirtualizer(false)
                    effects.enableReverb(false)
                    Toast.makeText(this, "Effects cleared", Toast.LENGTH_SHORT).show()
                }
                .show()
        } ?: Toast.makeText(this, "Effects not available", Toast.LENGTH_SHORT).show()
    }

    override fun onDestroy() {
        super.onDestroy()
        updateHandler.removeCallbacks(updateRunnable)
        audioEffectsManager?.release()
        binding.visualizerView.release()

        if (isBound) {
            unbindService(serviceConnection)
            isBound = false
        }
    }
}
