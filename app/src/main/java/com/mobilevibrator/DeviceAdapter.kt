package com.mobilevibrator

import android.content.Context
import android.graphics.drawable.Drawable
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.ImageView
import android.widget.TextView
import com.mobilevibrator.ControllerDevice
import com.mobilevibrator.DeviceType

class DeviceAdapter(
    context: Context,
    private val devices: List<ControllerDevice>
) : ArrayAdapter<ControllerDevice>(context, android.R.layout.simple_spinner_item, devices) {

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        val view = convertView ?: LayoutInflater.from(context).inflate(android.R.layout.simple_spinner_item, parent, false)
        
        val textView = view.findViewById<TextView>(android.R.id.text1)
        val iconView = ImageView(context).apply {
            layoutParams = android.view.ViewGroup.LayoutParams(24, 24)
            setPadding(0, 0, 8, 0)
        }
        
        val device = devices[position]
        textView.text = when (device.deviceType) {
            DeviceType.PHONE -> "📱 ${device.name}"
            DeviceType.XBOX -> "🎮 ${device.name}"
            DeviceType.PLAYSTATION -> "🎮 ${device.name}"
            DeviceType.OTHER -> "🎮 ${device.name}"
        }
        
        // Set icon based on device type
        val iconRes = when (device.deviceType) {
            DeviceType.PHONE -> R.drawable.phone_icon
            DeviceType.XBOX -> R.drawable.xbox_icon
            DeviceType.PLAYSTATION -> R.drawable.playstation_icon
            DeviceType.OTHER -> R.drawable.other_icon
        }
        
        try {
            val icon = context.getDrawable(iconRes)
            icon?.let {
                iconView.setImageDrawable(it)
            }
        } catch (e: Exception) {
            // Fallback if icon resource not found
        }
        
        // Create a custom layout with icon and text
        val linearLayout = android.widget.LinearLayout(context).apply {
            orientation = android.widget.LinearLayout.HORIZONTAL
            gravity = android.view.Gravity.CENTER_VERTICAL
            setPadding(16, 8, 16, 8)
        }
        
        linearLayout.addView(iconView)
        linearLayout.addView(textView)
        
        return linearLayout
    }
}
