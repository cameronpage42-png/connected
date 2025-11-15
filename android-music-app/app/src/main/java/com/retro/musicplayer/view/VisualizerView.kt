package com.retro.musicplayer.view

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.media.audiofx.Visualizer
import android.util.AttributeSet
import android.view.View
import com.retro.musicplayer.R
import kotlin.math.abs
import kotlin.math.min

class VisualizerView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private var visualizer: Visualizer? = null
    private var bytes: ByteArray? = null
    private var paint: Paint
    private var visualizerType = VisualizerType.WAVEFORM

    enum class VisualizerType {
        WAVEFORM, SPECTRUM, CIRCULAR, BARS
    }

    init {
        paint = Paint().apply {
            strokeWidth = 3f
            isAntiAlias = true
            color = context.getColor(R.color.retro_cyan)
            style = Paint.Style.STROKE
        }
    }

    fun setAudioSessionId(audioSessionId: Int) {
        release()

        try {
            visualizer = Visualizer(audioSessionId).apply {
                captureSize = Visualizer.getCaptureSizeRange()[1]

                setDataCaptureListener(object : Visualizer.OnDataCaptureListener {
                    override fun onWaveFormDataCapture(
                        visualizer: Visualizer?,
                        waveform: ByteArray?,
                        samplingRate: Int
                    ) {
                        if (visualizerType == VisualizerType.WAVEFORM ||
                            visualizerType == VisualizerType.CIRCULAR) {
                            bytes = waveform
                            invalidate()
                        }
                    }

                    override fun onFftDataCapture(
                        visualizer: Visualizer?,
                        fft: ByteArray?,
                        samplingRate: Int
                    ) {
                        if (visualizerType == VisualizerType.SPECTRUM ||
                            visualizerType == VisualizerType.BARS) {
                            bytes = fft
                            invalidate()
                        }
                    }
                }, Visualizer.getMaxCaptureRate() / 2, true, true)

                enabled = true
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun setVisualizerType(type: VisualizerType) {
        visualizerType = type
        invalidate()
    }

    fun release() {
        visualizer?.apply {
            enabled = false
            release()
        }
        visualizer = null
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        bytes?.let { data ->
            when (visualizerType) {
                VisualizerType.WAVEFORM -> drawWaveform(canvas, data)
                VisualizerType.SPECTRUM -> drawSpectrum(canvas, data)
                VisualizerType.CIRCULAR -> drawCircular(canvas, data)
                VisualizerType.BARS -> drawBars(canvas, data)
            }
        }
    }

    private fun drawWaveform(canvas: Canvas, waveform: ByteArray) {
        val width = width.toFloat()
        val height = height.toFloat()
        val centerY = height / 2

        paint.color = context.getColor(R.color.retro_cyan)
        paint.strokeWidth = 4f

        val points = mutableListOf<Float>()
        val step = waveform.size / width.toInt()

        for (i in 0 until width.toInt()) {
            val index = i * step
            if (index < waveform.size) {
                val value = (waveform[index].toInt() + 128).toFloat()
                val y = centerY + (value - 128) * (height / 256f)

                if (i > 0) {
                    points.add((i - 1).toFloat())
                    points.add(points.last())
                    points.add(i.toFloat())
                    points.add(y)
                }
            }
        }

        if (points.size >= 4) {
            canvas.drawLines(points.toFloatArray(), paint)
        }
    }

    private fun drawSpectrum(canvas: Canvas, fft: ByteArray) {
        val width = width.toFloat()
        val height = height.toFloat()

        paint.color = context.getColor(R.color.retro_purple)
        paint.strokeWidth = 2f
        paint.style = Paint.Style.FILL

        val barCount = min(128, fft.size / 2)
        val barWidth = width / barCount

        for (i in 0 until barCount) {
            val rfk = fft[i * 2].toInt()
            val ifk = fft[i * 2 + 1].toInt()
            val magnitude = (rfk * rfk + ifk * ifk).toFloat()
            val dbValue = (10 * Math.log10(magnitude.toDouble() + 1)).toFloat()

            val barHeight = min(dbValue * 10, height)

            // Gradient effect
            val alpha = (255 * (i.toFloat() / barCount)).toInt()
            paint.alpha = 255 - alpha

            canvas.drawRect(
                i * barWidth,
                height - barHeight,
                (i + 1) * barWidth - 2,
                height,
                paint
            )
        }

        paint.alpha = 255
        paint.style = Paint.Style.STROKE
    }

    private fun drawCircular(canvas: Canvas, waveform: ByteArray) {
        val centerX = width / 2f
        val centerY = height / 2f
        val radius = min(width, height) / 3f

        paint.color = context.getColor(R.color.retro_pink)
        paint.strokeWidth = 3f

        val points = mutableListOf<Float>()
        val sampleCount = min(360, waveform.size)

        for (i in 0 until sampleCount) {
            val angle = (i.toFloat() / sampleCount) * 2 * Math.PI
            val value = abs(waveform[i].toInt())
            val amplitude = radius + (value / 128f) * (radius / 2)

            val x = (centerX + amplitude * Math.cos(angle)).toFloat()
            val y = (centerY + amplitude * Math.sin(angle)).toFloat()

            if (i > 0) {
                points.add(points[points.size - 2])
                points.add(points[points.size - 1])
                points.add(x)
                points.add(y)
            } else {
                points.add(x)
                points.add(y)
            }
        }

        if (points.size >= 4) {
            // Connect last point to first
            points.add(points[points.size - 2])
            points.add(points[points.size - 1])
            points.add(points[0])
            points.add(points[1])

            canvas.drawLines(points.toFloatArray(), paint)
        }
    }

    private fun drawBars(canvas: Canvas, fft: ByteArray) {
        val width = width.toFloat()
        val height = height.toFloat()

        paint.style = Paint.Style.FILL

        val barCount = min(64, fft.size / 4)
        val barWidth = width / barCount

        for (i in 0 until barCount) {
            val rfk = fft[i * 4].toInt()
            val ifk = fft[i * 4 + 1].toInt()
            val magnitude = (rfk * rfk + ifk * ifk).toFloat()
            val dbValue = (10 * Math.log10(magnitude.toDouble() + 1)).toFloat()

            val barHeight = min(dbValue * 12, height)

            // Alternate colors for retro effect
            paint.color = if (i % 2 == 0) {
                context.getColor(R.color.retro_cyan)
            } else {
                context.getColor(R.color.retro_yellow)
            }

            canvas.drawRect(
                i * barWidth + 2,
                height - barHeight,
                (i + 1) * barWidth - 2,
                height,
                paint
            )
        }

        paint.style = Paint.Style.STROKE
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        release()
    }
}
