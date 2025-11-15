package com.retro.musicplayer.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.Binder
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.retro.musicplayer.MainActivity
import com.retro.musicplayer.R
import com.retro.musicplayer.Song

class MusicService : Service() {

    private var mediaPlayer: MediaPlayer? = null
    private var currentSong: Song? = null
    private var playlist: List<Song> = emptyList()
    private var currentPosition = 0
    private var isShuffleEnabled = false
    private var repeatMode = REPEAT_OFF // REPEAT_OFF, REPEAT_ONE, REPEAT_ALL

    private val binder = MusicBinder()
    private var onPlaybackStateChanged: ((Boolean) -> Unit)? = null
    private var onSongChanged: ((Song?) -> Unit)? = null
    private var onProgressChanged: ((Int) -> Unit)? = null

    companion object {
        const val CHANNEL_ID = "music_playback_channel"
        const val NOTIFICATION_ID = 1
        const val REPEAT_OFF = 0
        const val REPEAT_ONE = 1
        const val REPEAT_ALL = 2
    }

    inner class MusicBinder : Binder() {
        fun getService(): MusicService = this@MusicService
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        initializeMediaPlayer()
    }

    override fun onBind(intent: Intent?): IBinder {
        return binder
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Music Playback",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Music player controls"
                setShowBadge(false)
            }

            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager?.createNotificationChannel(channel)
        }
    }

    private fun initializeMediaPlayer() {
        mediaPlayer = MediaPlayer().apply {
            setAudioAttributes(
                AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .build()
            )

            setOnCompletionListener {
                if (repeatMode == REPEAT_ONE) {
                    seekTo(0)
                    start()
                } else {
                    playNext()
                }
            }

            setOnPreparedListener {
                start()
                onPlaybackStateChanged?.invoke(true)
                onSongChanged?.invoke(currentSong)
                startForeground(NOTIFICATION_ID, createNotification())
            }
        }
    }

    fun setPlaylist(songs: List<Song>, startPosition: Int = 0) {
        playlist = songs
        currentPosition = startPosition
        playSong(playlist[currentPosition])
    }

    fun playSong(song: Song) {
        try {
            currentSong = song
            mediaPlayer?.apply {
                reset()
                setDataSource(song.path)
                prepareAsync()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun play() {
        mediaPlayer?.start()
        onPlaybackStateChanged?.invoke(true)
        startForeground(NOTIFICATION_ID, createNotification())
    }

    fun pause() {
        mediaPlayer?.pause()
        onPlaybackStateChanged?.invoke(false)
    }

    fun playNext() {
        if (playlist.isEmpty()) return

        currentPosition = if (isShuffleEnabled) {
            (0 until playlist.size).random()
        } else {
            (currentPosition + 1) % playlist.size
        }

        playSong(playlist[currentPosition])
    }

    fun playPrevious() {
        if (playlist.isEmpty()) return

        currentPosition = if (currentPosition > 0) {
            currentPosition - 1
        } else {
            playlist.size - 1
        }

        playSong(playlist[currentPosition])
    }

    fun seekTo(position: Int) {
        mediaPlayer?.seekTo(position)
    }

    fun toggleShuffle(): Boolean {
        isShuffleEnabled = !isShuffleEnabled
        return isShuffleEnabled
    }

    fun toggleRepeat(): Int {
        repeatMode = (repeatMode + 1) % 3
        return repeatMode
    }

    fun isPlaying(): Boolean = mediaPlayer?.isPlaying ?: false

    fun getCurrentPosition(): Int = mediaPlayer?.currentPosition ?: 0

    fun getDuration(): Int = mediaPlayer?.duration ?: 0

    fun getCurrentSong(): Song? = currentSong

    fun getAudioSessionId(): Int = mediaPlayer?.audioSessionId ?: 0

    fun setOnPlaybackStateChangedListener(listener: (Boolean) -> Unit) {
        onPlaybackStateChanged = listener
    }

    fun setOnSongChangedListener(listener: (Song?) -> Unit) {
        onSongChanged = listener
    }

    fun setOnProgressChangedListener(listener: (Int) -> Unit) {
        onProgressChanged = listener
    }

    private fun createNotification(): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(currentSong?.title ?: "Retro Music Player")
            .setContentText(currentSong?.artist ?: "No song playing")
            .setSmallIcon(R.drawable.ic_music_note)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        mediaPlayer?.release()
        mediaPlayer = null
    }
}
