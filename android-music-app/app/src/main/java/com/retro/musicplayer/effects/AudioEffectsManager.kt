package com.retro.musicplayer.effects

import android.media.audiofx.BassBoost
import android.media.audiofx.Equalizer
import android.media.audiofx.PresetReverb
import android.media.audiofx.Virtualizer

class AudioEffectsManager(private val audioSessionId: Int) {

    private var equalizer: Equalizer? = null
    private var bassBoost: BassBoost? = null
    private var virtualizer: Virtualizer? = null
    private var reverb: PresetReverb? = null

    init {
        initializeEffects()
    }

    private fun initializeEffects() {
        try {
            // Equalizer
            equalizer = Equalizer(0, audioSessionId).apply {
                enabled = false
            }

            // Bass Boost
            bassBoost = BassBoost(0, audioSessionId).apply {
                enabled = false
            }

            // Virtualizer (3D surround effect)
            virtualizer = Virtualizer(0, audioSessionId).apply {
                enabled = false
            }

            // Reverb
            reverb = PresetReverb(0, audioSessionId).apply {
                enabled = false
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // Equalizer Controls
    fun enableEqualizer(enable: Boolean) {
        equalizer?.enabled = enable
    }

    fun setEqualizerPreset(preset: Short) {
        equalizer?.usePreset(preset)
    }

    fun getEqualizerPresetNames(): List<String> {
        val presets = mutableListOf<String>()
        equalizer?.let { eq ->
            for (i in 0 until eq.numberOfPresets) {
                presets.add(eq.getPresetName(i.toShort()))
            }
        }
        return presets
    }

    fun getNumberOfBands(): Short = equalizer?.numberOfBands ?: 0.toShort()

    fun getBandLevelRange(): ShortArray {
        val eq = equalizer ?: return shortArrayOf(0, 0)
        return shortArrayOf(eq.bandLevelRange[0], eq.bandLevelRange[1])
    }

    fun setBandLevel(band: Short, level: Short) {
        equalizer?.setBandLevel(band, level)
    }

    fun getBandLevel(band: Short): Short = equalizer?.getBandLevel(band) ?: 0

    fun getCenterFreq(band: Short): Int = equalizer?.getCenterFreq(band) ?: 0

    // Bass Boost Controls
    fun enableBassBoost(enable: Boolean) {
        bassBoost?.enabled = enable
    }

    fun setBassBoostStrength(strength: Short) {
        try {
            bassBoost?.setStrength(strength)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun getBassBoostStrength(): Short = bassBoost?.roundedStrength ?: 0

    // Virtualizer Controls
    fun enableVirtualizer(enable: Boolean) {
        virtualizer?.enabled = enable
    }

    fun setVirtualizerStrength(strength: Short) {
        try {
            virtualizer?.setStrength(strength)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun getVirtualizerStrength(): Short = virtualizer?.roundedStrength ?: 0

    // Reverb Controls
    fun enableReverb(enable: Boolean) {
        reverb?.enabled = enable
    }

    fun setReverbPreset(preset: Short) {
        try {
            reverb?.preset = preset
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // Reverb presets
    companion object {
        const val REVERB_NONE = PresetReverb.PRESET_NONE.toShort()
        const val REVERB_SMALLROOM = PresetReverb.PRESET_SMALLROOM.toShort()
        const val REVERB_MEDIUMROOM = PresetReverb.PRESET_MEDIUMROOM.toShort()
        const val REVERB_LARGEROOM = PresetReverb.PRESET_LARGEROOM.toShort()
        const val REVERB_MEDIUMHALL = PresetReverb.PRESET_MEDIUMHALL.toShort()
        const val REVERB_LARGEHALL = PresetReverb.PRESET_LARGEHALL.toShort()
        const val REVERB_PLATE = PresetReverb.PRESET_PLATE.toShort()
    }

    fun release() {
        equalizer?.release()
        bassBoost?.release()
        virtualizer?.release()
        reverb?.release()

        equalizer = null
        bassBoost = null
        virtualizer = null
        reverb = null
    }
}
