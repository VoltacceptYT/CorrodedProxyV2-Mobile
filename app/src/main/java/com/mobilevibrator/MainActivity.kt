package com.mobilevibrator

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.widget.ArrayAdapter
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.material.switchmaterial.SwitchMaterial

class MainActivity : AppCompatActivity() {

    private lateinit var toggleVibration: SwitchMaterial
    private lateinit var tvStatus: TextView
    private lateinit var spinnerDevices: Spinner
    private lateinit var vibrator: Vibrator
    private lateinit var controllerManager: ControllerManager
    private var isVibrating = false
    private var selectedDeviceId: Int = -1
    private var useController = false
    
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
    }

    private fun updateDeviceList(devices: List<ControllerDevice>) {
        val deviceNames = mutableListOf("Phone Vibration")
        val deviceIds = mutableListOf(-1)
        
        devices.forEach { device ->
            deviceNames.add("${device.name} (${if (device.isBluetooth) "Bluetooth" else "Wired"})")
            deviceIds.add(device.id)
        }
        
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, deviceNames)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerDevices.adapter = adapter
        
        spinnerDevices.onItemSelectedListener = object : android.widget.AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: android.view.View?, position: Int, id: Long) {
                selectedDeviceId = deviceIds[position]
                useController = position > 0
                if (isVibrating) {
                    stopVibration()
                    startMaxVibration()
                }
            }
            
            override fun onNothingSelected(parent: android.widget.AdapterView<*>?) {
                // Do nothing
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
        
        if (useController && selectedDeviceId != -1) {
            controllerManager.stopControllerVibration(selectedDeviceId)
        } else {
            vibrator.cancel()
        }
    }

    private fun updateStatus(vibrating: Boolean) {
        val deviceName = if (useController) {
            spinnerDevices.selectedItem?.toString() ?: "Controller"
        } else {
            "Phone"
        }
        
        if (vibrating) {
            tvStatus.text = "$deviceName: Vibration ON"
            tvStatus.setTextColor("#4CAF50".toInt())
        } else {
            tvStatus.text = "$deviceName: Vibration OFF"
            tvStatus.setTextColor("#FF6B6B".toInt())
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
