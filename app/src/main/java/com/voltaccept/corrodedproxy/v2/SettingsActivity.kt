package com.voltaccept.corrodedproxy.v2

import android.content.SharedPreferences
import android.os.Bundle
import android.widget.Button
import android.widget.RadioGroup
import android.widget.Switch
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class SettingsActivity : AppCompatActivity() {
    
    private lateinit var sharedPreferences: SharedPreferences
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)
        
        sharedPreferences = getSharedPreferences("CorrodedProxyPrefs", MODE_PRIVATE)
        
        setupThemeSettings()
        setupActionButtons()
    }
    
    private fun setupThemeSettings() {
        val themeRadioGroup = findViewById<RadioGroup>(R.id.theme_radio_group)
        val currentTheme = sharedPreferences.getString("theme", "Earth")
        
        val themeId = when (currentTheme) {
            "Earth" -> R.id.radio_earth
            "Virellus" -> R.id.radio_virellus
            "Neptune" -> R.id.radio_neptune
            "Mars" -> R.id.radio_mars
            "Solar" -> R.id.radio_solar
            else -> R.id.radio_earth
        }
        
        themeRadioGroup.check(themeId)
        
        themeRadioGroup.setOnCheckedChangeListener { _, checkedId ->
            val theme = when (checkedId) {
                R.id.radio_earth -> "Earth"
                R.id.radio_virellus -> "Virellus"
                R.id.radio_neptune -> "Neptune"
                R.id.radio_mars -> "Mars"
                R.id.radio_solar -> "Solar"
                else -> "Earth"
            }
            
            sharedPreferences.edit().putString("theme", theme).apply()
            Toast.makeText(this, "Theme changed to $theme", Toast.LENGTH_SHORT).show()
        }
    }
    
    private fun setupActionButtons() {
        val saveButton = findViewById<Button>(R.id.save_button)
        val resetButton = findViewById<Button>(R.id.reset_button)
        val importButton = findViewById<Button>(R.id.import_button)
        val exportButton = findViewById<Button>(R.id.export_button)
        
        saveButton.setOnClickListener {
            Toast.makeText(this, "Settings saved", Toast.LENGTH_SHORT).show()
            finish()
        }
        
        resetButton.setOnClickListener {
            sharedPreferences.edit().clear().apply()
            Toast.makeText(this, "Settings reset", Toast.LENGTH_SHORT).show()
            finish()
        }
        
        importButton.setOnClickListener {
            Toast.makeText(this, "Import - Coming Soon", Toast.LENGTH_SHORT).show()
        }
        
        exportButton.setOnClickListener {
            Toast.makeText(this, "Export - Coming Soon", Toast.LENGTH_SHORT).show()
        }
    }
}
