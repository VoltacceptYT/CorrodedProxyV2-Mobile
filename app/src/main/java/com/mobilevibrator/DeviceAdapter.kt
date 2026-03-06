package com.mobilevibrator

import android.content.Context
import android.graphics.drawable.Drawable
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.mobilevibrator.ControllerDevice
import com.mobilevibrator.DeviceType

class DeviceAdapter(
    context: Context,
    private val devices: List<ControllerDevice>
) : ArrayAdapter<ControllerDevice>(context, android.R.layout.simple_spinner_item, devices) {

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        val view = convertView ?: LayoutInflater.from(context).inflate(
            android.R.layout.simple_spinner_item, 
            parent, 
            false
        )
        
        val textView = view.findViewById<TextView>(android.R.id.text1)
        val device = devices[position]
        
        // Set device name
        textView.text = device.name
        textView.setTextColor(ContextCompat.getColor(context, com.mobilevibrator.R.color.on_surface))
        
        // Get appropriate Material Design icon
        val iconDrawable = getDeviceIcon(device.deviceType)
        iconDrawable?.let { icon ->
            // Create layout with icon and text
            val linearLayout = LinearLayout(context).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = android.view.Gravity.CENTER_VERTICAL
                setPadding(16, 8, 16, 8)
            }
            
            // Icon
            val iconView = ImageView(context).apply {
                setImageDrawable(icon)
                layoutParams = LinearLayout.LayoutParams(24, 24).apply {
                    setMargins(0, 0, 8, 0)
                }
            }
            
            // Text
            val textParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply {
                setMargins(0, 0, 8, 0)
            }
            textView.layoutParams = textParams
            
            linearLayout.addView(iconView)
            linearLayout.addView(textView)
            
            // Replace the original text view with our custom layout
            (view as? ViewGroup)?.removeAllViews()
            (view as? ViewGroup)?.addView(linearLayout)
        }
        
        return view
    }
    
    private fun getDeviceIcon(deviceType: DeviceType): Drawable? {
        return when (deviceType) {
            DeviceType.PHONE -> ContextCompat.getDrawable(context, com.mobilevibrator.R.drawable.ic_device_vibration)
            DeviceType.XBOX -> ContextCompat.getDrawable(context, com.mobilevibrator.R.drawable.ic_gamepad)
            DeviceType.PLAYSTATION -> ContextCompat.getDrawable(context, com.mobilevibrator.R.drawable.ic_gamepad)
            DeviceType.OTHER -> ContextCompat.getDrawable(context, com.mobilevibrator.R.drawable.ic_devices_other)
        }
    }
}
