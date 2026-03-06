package com.mobilevibrator

import android.content.Context
import android.hardware.input.InputManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.InputDevice
import android.view.MotionEvent
import androidx.core.content.ContextCompat

data class ControllerDevice(
    val id: Int,
    val name: String,
    val descriptor: String,
    val hasVibrator: Boolean,
    val isBluetooth: Boolean,
    val deviceType: DeviceType
)

enum class DeviceType {
    PHONE,
    XBOX,
    PLAYSTATION,
    OTHER
}

class ControllerManager(private val context: Context) : InputManager.InputDeviceListener {

    private val inputManager = context.getSystemService(Context.INPUT_SERVICE) as InputManager
    private val deviceVibrators = mutableMapOf<Int, Vibrator>()
    private var deviceListener: ((List<ControllerDevice>) -> Unit)? = null
    private val handler = Handler(Looper.getMainLooper())
    private var vibrationCompleteListener: (() -> Unit)? = null
    
    init {
        inputManager.registerInputDeviceListener(this, null)
    }

    fun getConnectedControllers(): List<ControllerDevice> {
        val devices = mutableListOf<ControllerDevice>()
        
        InputDevice.getDeviceIds().forEach { deviceId ->
            val device = InputDevice.getDevice(deviceId)
            device?.let {
                if (isGameController(it)) {
                    val deviceType = getDeviceType(it)
                    val controller = ControllerDevice(
                        id = it.id,
                        name = it.name,
                        descriptor = it.descriptor,
                        hasVibrator = it.vibrator?.hasVibrator() ?: false,
                        isBluetooth = isBluetoothDevice(it),
                        deviceType = deviceType
                    )
                    devices.add(controller)
                    
                    // Cache vibrator for this device
                    if (controller.hasVibrator) {
                        deviceVibrators[deviceId] = it.vibrator
                    }
                }
            }
        }
        
        return devices
    }

    private fun getDeviceType(device: InputDevice): DeviceType {
        val name = device.name.lowercase()
        return when {
            name.contains("xbox") -> DeviceType.XBOX
            name.contains("playstation") || name.contains("dualshock") || name.contains("dualsense") -> DeviceType.PLAYSTATION
            else -> DeviceType.OTHER
        }
    }

    fun setDeviceListener(listener: (List<ControllerDevice>) -> Unit) {
        deviceListener = listener
        listener(getConnectedControllers())
    }

    fun setVibrationCompleteListener(listener: () -> Unit) {
        vibrationCompleteListener = listener
    }

    fun vibrateController(deviceId: Int, intensity: Float = 1.0f) {
        val vibrator = deviceVibrators[deviceId]
        vibrator?.let { vibrateDevice(it, intensity) }
    }

    fun vibrateAllControllers(intensity: Float = 1.0f) {
        deviceVibrators.values.forEach { vibrateDevice(it, intensity) }
    }

    fun stopControllerVibration(deviceId: Int) {
        deviceVibrators[deviceId]?.cancel()
    }

    fun stopAllControllerVibration() {
        deviceVibrators.values.forEach { it.cancel() }
    }

    private fun vibrateDevice(vibrator: Vibrator, intensity: Float) {
        if (!vibrator.hasVibrator()) return

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Create vibration pattern: 0.5s vibration at different levels with 0.1s delays
            val timings = longArrayOf(0, 500, 100, 500, 100, 500, 100, 500, 100, 500)
            val amplitudes = intArrayOf(0, 51, 0, 102, 0, 153, 0, 204, 0, 255)
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val vibrationEffect = VibrationEffect.createWaveform(timings, amplitudes, -1)
                vibrator.vibrate(vibrationEffect)
            } else {
                val vibrationEffect = VibrationEffect.createWaveform(timings, -1)
                vibrator.vibrate(vibrationEffect)
            }
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(longArrayOf(0, 500, 100, 500, 100, 500, 100, 500, 100, 500), -1)
        }
        
        // Auto-turn off toggle after vibration completes (2.9 seconds)
        handler.postDelayed({
            vibrationCompleteListener?.invoke()
        }, 2900) // 2.9 seconds total duration
    }

    private fun isGameController(device: InputDevice): Boolean {
        // Check if device is a game controller
        return (device.sources and InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD ||
               (device.sources and InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK ||
               device.name.contains("controller", ignoreCase = true) ||
               device.name.contains("gamepad", ignoreCase = true) ||
               device.name.contains("joystick", ignoreCase = true)
    }

    private fun isBluetoothDevice(device: InputDevice): Boolean {
        return device.name.contains("Bluetooth", ignoreCase = true) ||
               device.descriptor.contains("bluetooth", ignoreCase = true)
    }

    // InputDeviceListener callbacks
    override fun onInputDeviceAdded(deviceId: Int) {
        deviceListener?.invoke(getConnectedControllers())
    }

    override fun onInputDeviceRemoved(deviceId: Int) {
        deviceVibrators.remove(deviceId)
        deviceListener?.invoke(getConnectedControllers())
    }

    override fun onInputDeviceChanged(deviceId: Int) {
        // Refresh device list and vibrator cache
        val device = InputDevice.getDevice(deviceId)
        device?.let {
            if (isGameController(it) && it.vibrator?.hasVibrator() == true) {
                deviceVibrators[deviceId] = it.vibrator
            } else {
                deviceVibrators.remove(deviceId)
            }
        }
        deviceListener?.invoke(getConnectedControllers())
    }

    fun cleanup() {
        stopAllControllerVibration()
        inputManager.unregisterInputDeviceListener(this)
        deviceVibrators.clear()
    }

    // Get device vibration capabilities
    fun getVibrationCapabilities(deviceId: Int): Map<String, Any>? {
        val device = InputDevice.getDevice(deviceId) ?: return null
        val vibrator = device.vibrator ?: return null
        
        return mapOf(
            "hasVibrator" to vibrator.hasVibrator(),
            "hasAmplitudeControl" to (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q),
            "supportedEffects" to if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                listOf("waveform", "oneShot", "predefined")
            } else {
                listOf("basic")
            }
        )
    }
}
