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
import android.widget.ImageView
import android.widget.SeekBar
import android.widget.Spinner
import android.widget.Switch
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.ContextCompat.getColor

class MainActivity : AppCompatActivity() {

    private lateinit var toggleVibration: Switch
    private lateinit var tvStatus: TextView
    private lateinit var spinnerDevices: Spinner
    private lateinit var intensitySlider: SeekBar
    private lateinit var intensityValue: TextView
    private lateinit var appIcon: ImageView
    private lateinit var vibrator: Vibrator
    private lateinit var controllerManager: ControllerManager
    private lateinit var deviceAdapter: DeviceAdapter
    private var isVibrating = false
    private var selectedDeviceId: Int = -1
    private var useController = false
    private val handler = Handler(Looper.getMainLooper())
    private var vibrationIntensity = 1.0f
    
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
        initControllerManager()
        checkBluetoothPermissions()
    }

    private fun initViews() {
        toggleVibration = findViewById(R.id.toggleVibration)
        tvStatus = findViewById(R.id.tvStatus)
        spinnerDevices = findViewById(R.id.spinnerDevices)
        intensitySlider = findViewById(R.id.intensitySlider)
        intensityValue = findViewById(R.id.intensityValue)
        appIcon = findViewById(R.id.appIcon)
        
        // Initialize vibrator
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibrator = vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
        
        // Set up intensity slider
        intensitySlider.max = 100
        intensitySlider.progress = 100
        intensityValue.text = "100%"
        
        intensitySlider.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                vibrationIntensity = progress / 100f
                intensityValue.text = "$progress%"
                
                // Live vibration update - restart vibration with new intensity if currently vibrating
                if (isVibrating && fromUser) {
                    stopVibration()
                    startMaxVibration()
                }
            }
            
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })
        
        // Set up toggle listener
        toggleVibration.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                startMaxVibration()
            } else {
                stopVibration()
            }
        }
        
        // Set app icon
        appIcon.setImageResource(R.mipmap.ic_launcher)
    }

    private fun initControllerManager() {
        controllerManager = ControllerManager(this)
        controllerManager.setDeviceListener { devices ->
            updateDeviceList(devices)
        }
        controllerManager.setVibrationCompleteListener {
            // Restart controller vibration after 10 seconds for infinite loop
            if (isVibrating && useController) {
                runOnUiThread {
                    startMaxVibration()
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
        spinnerDevices.adapter = deviceAdapter
        
        spinnerDevices.onItemSelectedListener = object : android.widget.AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: android.view.View?, position: Int, id: Long) {
                val selectedDevice = allDevices[position]
                selectedDeviceId = selectedDevice.id
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
        if (useController && selectedDeviceId != -1) {
            controllerManager.vibrateController(selectedDeviceId, vibrationIntensity)
            isVibrating = true
            updateStatus(true)
        } else {
            startPhoneVibration()
            isVibrating = true
            updateStatus(true)
        }
    }

    private fun startPhoneVibration() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Create continuous vibration at selected intensity (100x stronger)
            val amplitude = (vibrationIntensity * 255 * 100).toInt()
            val vibrationEffect = VibrationEffect.createOneShot(10000, amplitude) // 10 seconds
            vibrator.vibrate(vibrationEffect)
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(10000) // 10 seconds for older versions
        }
        
        // Schedule restart after 10 seconds to create infinite loop
        handler.postDelayed({
            if (isVibrating && !useController) {
                startPhoneVibration() // Restart vibration
            }
        }, 10000) // Restart after 10 seconds
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
            val selectedDevice = deviceAdapter.getItem(spinnerDevices.selectedItemPosition)
            selectedDevice?.name ?: "Controller"
        } else {
            getString(R.string.device_phone)
        }
        
        if (vibrating) {
            tvStatus.text = "$deviceName: ${getString(R.string.vibration_on)}"
            tvStatus.setTextColor(ContextCompat.getColor(this, R.color.success))
        } else {
            tvStatus.text = "$deviceName: ${getString(R.string.vibration_off)}"
            tvStatus.setTextColor(ContextCompat.getColor(this, R.color.text_secondary))
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
