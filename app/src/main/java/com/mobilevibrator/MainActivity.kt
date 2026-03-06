package com.mobilevibrator

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.widget.ArrayAdapter
import android.widget.AutoCompleteTextView
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.ContextCompat.getColor
import com.google.android.material.switchmaterial.SwitchMaterial

class MainActivity : AppCompatActivity() {

    private lateinit var toggleVibration: SwitchMaterial
    private lateinit var tvStatus: TextView
    private lateinit var spinnerDevices: AutoCompleteTextView
    private lateinit var vibrator: Vibrator
    private lateinit var controllerManager: ControllerManager
    private lateinit var deviceAdapter: DeviceAdapter
    private var isVibrating = false
    private var selectedDeviceId: Int = -1
    private var useController = false
    private val handler = Handler(Looper.getMainLooper())
    
    companion object {
        private const val BLUETOOTH_PERMISSION_REQUEST_CODE = 100
        private val BLUETOOTH_PERMISSIONS = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            arrayOf(
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.BLUETOOTH_CONNECT
            )
        } else {
            arrayOf(
                Manifest.permission.BLUETOOTH,
                Manifest.permission.BLUETOOTH_ADMIN
            )
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        initVibrator()
        initControllerManager()
        setupToggleListener()
        checkBluetoothPermissions()
    }

    private fun initViews() {
        toggleVibration = findViewById(R.id.toggleVibration)
        tvStatus = findViewById(R.id.tvStatus)
        spinnerDevices = findViewById(R.id.spinnerDevices)
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

    private fun initControllerManager() {
        controllerManager = ControllerManager(this)
        controllerManager.setDeviceListener { devices ->
            updateDeviceList(devices)
        }
        controllerManager.setVibrationCompleteListener {
            // Auto-turn off toggle after controller vibration completes
            if (isVibrating && useController) {
                runOnUiThread {
                    toggleVibration.isChecked = false
                    isVibrating = false
                    updateStatus(false)
                }
            }
        }
    }

    private fun updateDeviceList(devices: List<ControllerDevice>) {
        val allDevices = mutableListOf<ControllerDevice>()
        
        // Add phone as first device
        allDevices.add(ControllerDevice(
            id = -1,
            name = "Phone Vibration",
            descriptor = "phone",
            hasVibrator = vibrator.hasVibrator(),
            isBluetooth = false,
            deviceType = DeviceType.PHONE
        ))
        
        // Add controllers
        allDevices.addAll(devices)
        
        // Update adapter with all devices
        deviceAdapter = DeviceAdapter(this, allDevices)
        spinnerDevices.setAdapter(deviceAdapter)
        
        spinnerDevices.setOnItemClickListener { parent, view, position, id ->
            val selectedDevice = allDevices[position]
            selectedDeviceId = selectedDevice.id
            useController = position > 0
            if (isVibrating) {
                stopVibration()
                startMaxVibration()
            }
        }
    }

    private fun checkBluetoothPermissions() {
        val missingPermissions = BLUETOOTH_PERMISSIONS.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        
        if (missingPermissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(
                this,
                missingPermissions.toTypedArray(),
                BLUETOOTH_PERMISSION_REQUEST_CODE
            )
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == BLUETOOTH_PERMISSION_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                // Permissions granted, refresh device list
                controllerManager.setDeviceListener { devices ->
                    updateDeviceList(devices)
                }
            } else {
                Toast.makeText(this, "Bluetooth permissions required for controller support", Toast.LENGTH_LONG).show()
            }
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
        val success = if (useController) {
            if (selectedDeviceId != -1) {
                controllerManager.vibrateController(selectedDeviceId, 1.0f)
                true
            } else {
                false
            }
        } else {
            if (!vibrator.hasVibrator()) {
                false
            } else {
                startPhoneVibration()
                true
            }
        }

        if (success) {
            isVibrating = true
            updateStatus(true)
        } else {
            toggleVibration.isChecked = false
            Toast.makeText(this, "Selected device does not support vibration", Toast.LENGTH_SHORT).show()
        }
    }

    private fun startPhoneVibration() {
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
            if (isVibrating && !useController) {
                toggleVibration.isChecked = false
                isVibrating = false
                updateStatus(false)
            }
        }, 2900) // 2.9 seconds total duration
    }

    private fun stopVibration() {
        isVibrating = false
        updateStatus(false)
        
        if (useController && selectedDeviceId != -1) {
            controllerManager.stopControllerVibration(selectedDeviceId)
        } else {
            vibrator.cancel()
        }
    }

    private fun updateStatus(vibrating: Boolean) {
        val deviceName = if (useController) {
            val position = spinnerDevices.text.toString().let { text ->
                allDevices.indexOfFirst { it.name == text }
            }
            val selectedDevice = if (position >= 0) allDevices[position] else null
            selectedDevice?.name ?: "Controller"
        } else {
            "Phone"
        }
        
        if (vibrating) {
            tvStatus.text = "$deviceName: Vibration ON"
            tvStatus.setTextColor(ContextCompat.getColor(this, R.color.vibration_on))
        } else {
            tvStatus.text = "$deviceName: Vibration OFF"
            tvStatus.setTextColor(ContextCompat.getColor(this, R.color.vibration_off))
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if (isVibrating) {
            stopVibration()
        }
        controllerManager.cleanup()
    }
}
