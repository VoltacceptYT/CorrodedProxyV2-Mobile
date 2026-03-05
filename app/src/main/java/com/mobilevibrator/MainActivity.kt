package com.mobilevibrator

import android.content.Context
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.switchmaterial.SwitchMaterial

class MainActivity : AppCompatActivity() {

    private lateinit var toggleVibration: SwitchMaterial
    private lateinit var tvStatus: TextView
    private lateinit var vibrator: Vibrator
    private var isVibrating = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        initVibrator()
        setupToggleListener()
    }

    private fun initViews() {
        toggleVibration = findViewById(R.id.toggleVibration)
        tvStatus = findViewById(R.id.tvStatus)
    }

    private fun initVibrator() {
        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
    }

    private fun setupToggleListener() {
        toggleVibration.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                startMaxVibration()
            } else {
                stopVibration()
            }
        }
    }

    private fun startMaxVibration() {
        if (!vibrator.hasVibrator()) {
            toggleVibration.isChecked = false
            return
        }

        isVibrating = true
        updateStatus(true)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Create continuous vibration effect at maximum amplitude
            val vibrationEffect = VibrationEffect.createWaveform(
                longArrayOf(0, 1000), // Pattern: vibrate for 1 second continuously
                0 // Repeat indefinitely
            )
            vibrator.vibrate(vibrationEffect)
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(longArrayOf(0, 1000), 0)
        }
    }

    private fun stopVibration() {
        isVibrating = false
        updateStatus(false)
        vibrator.cancel()
    }

    private fun updateStatus(vibrating: Boolean) {
        if (vibrating) {
            tvStatus.text = "Vibration: ON"
            tvStatus.setTextColor("#4CAF50".toInt())
        } else {
            tvStatus.text = "Vibration: OFF"
            tvStatus.setTextColor("#FF6B6B".toInt())
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if (isVibrating) {
            vibrator.cancel()
        }
    }
}
