package com.corrodedproxy.v2.activities

import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.corrodedproxy.v2.R
import com.corrodedproxy.v2.managers.BookmarkManager
import com.corrodedproxy.v2.managers.HistoryManager
import com.corrodedproxy.v2.managers.PreferenceManager
import com.corrodedproxy.v2.managers.TabManager
import com.corrodedproxy.v2.models.SearchEngine
import com.corrodedproxy.v2.utils.ThemeUtils
import com.google.android.material.snackbar.Snackbar
import com.google.android.material.switchmaterial.SwitchMaterial

class SettingsActivity : AppCompatActivity() {

    private lateinit var prefManager: PreferenceManager
    private lateinit var historyManager: HistoryManager
    private lateinit var bookmarkManager: BookmarkManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        prefManager = PreferenceManager(this)
        historyManager = HistoryManager(this)
        bookmarkManager = BookmarkManager(this)

        setupToolbar()
        setupThemeSelector()
        setupSearchEngineSpinner()
        setupPrivacyToggles()
        setupDataButtons()
        applyTheme()
    }

    private fun setupToolbar() {
        findViewById<ImageButton>(R.id.btn_back_settings).setOnClickListener {
            finish()
            overridePendingTransition(android.R.anim.fade_in, R.anim.slide_out_down)
        }
    }

    private fun setupThemeSelector() {
        val themeSelector = findViewById<LinearLayout>(R.id.theme_selector)
        val themes = listOf(
            Triple("Earth", R.color.earth_accent, R.color.earth_bg_settings),
            Triple("Virellus", R.color.virellus_accent, R.color.virellus_bg_settings),
            Triple("Neptune", R.color.neptune_accent, R.color.neptune_bg_settings),
            Triple("Mars", R.color.mars_accent, R.color.mars_bg_settings),
            Triple("Solar", R.color.solar_accent, R.color.solar_bg_settings)
        )
        val currentTheme = prefManager.theme

        themeSelector.removeAllViews()
        for ((name, accentRes, bgRes) in themes) {
            val container = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.CENTER
                setPadding(8, 8, 8, 8)
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            }
            val circle = View(this).apply {
                layoutParams = LinearLayout.LayoutParams(44, 44)
                background = ContextCompat.getDrawable(context, R.drawable.rounded_bg)
                background.setTint(getColor(accentRes))
                if (name == currentTheme) {
                    scaleX = 1.15f
                    scaleY = 1.15f
                    alpha = 1.0f
                } else {
                    alpha = 0.6f
                }
            }
            val label = TextView(this).apply {
                text = name
                textSize = 11f
                setTextColor(getColor(R.color.text_secondary))
                gravity = Gravity.CENTER
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = 4 }
            }
            container.addView(circle)
            container.addView(label)
            container.setOnClickListener {
                prefManager.theme = name
                setupThemeSelector()
                applyTheme()
                Snackbar.make(
                    window.decorView.rootView,
                    "Theme changed to $name",
                    Snackbar.LENGTH_SHORT
                ).show()
            }
            themeSelector.addView(container)
        }
    }

    private fun setupSearchEngineSpinner() {
        val spinner = findViewById<Spinner>(R.id.search_engine_spinner)
        val engines = SearchEngine.values()
        val engineNames = engines.map { it.displayName }
        val adapter = ArrayAdapter(
            this,
            android.R.layout.simple_spinner_item,
            engineNames
        ).apply {
            setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        }
        spinner.adapter = adapter
        val currentIndex = engines.indexOf(prefManager.searchEngine)
        spinner.setSelection(if (currentIndex >= 0) currentIndex else 0)
        spinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>, view: View?, position: Int, id: Long) {
                prefManager.searchEngine = engines[position]
            }
            override fun onNothingSelected(parent: AdapterView<*>) {}
        }
    }

    private fun setupPrivacyToggles() {
        val switchJs = findViewById<SwitchMaterial>(R.id.switch_javascript)
        val switchCookies = findViewById<SwitchMaterial>(R.id.switch_cookies)
        val switchNoReferrer = findViewById<SwitchMaterial>(R.id.switch_no_referrer)

        switchJs.isChecked = prefManager.isJavaScriptEnabled
        switchCookies.isChecked = prefManager.isCookiesEnabled
        switchNoReferrer.isChecked = prefManager.isNoReferrer

        switchJs.setOnCheckedChangeListener { _, checked ->
            prefManager.isJavaScriptEnabled = checked
        }
        switchCookies.setOnCheckedChangeListener { _, checked ->
            prefManager.isCookiesEnabled = checked
        }
        switchNoReferrer.setOnCheckedChangeListener { _, checked ->
            prefManager.isNoReferrer = checked
        }
    }

    private fun setupDataButtons() {
        findViewById<Button>(R.id.btn_clear_history).setOnClickListener {
            historyManager.clearAll()
            Snackbar.make(window.decorView.rootView, "History cleared", Snackbar.LENGTH_SHORT).show()
        }
        findViewById<Button>(R.id.btn_clear_cookies).setOnClickListener {
            android.webkit.CookieManager.getInstance().removeAllCookies(null)
            android.webkit.CookieManager.getInstance().flush()
            Snackbar.make(window.decorView.rootView, "Cookies cleared", Snackbar.LENGTH_SHORT).show()
        }
        findViewById<Button>(R.id.btn_clear_cache).setOnClickListener {
            cacheDir.deleteRecursively()
            externalCacheDir?.deleteRecursively()
            Snackbar.make(window.decorView.rootView, "Cache cleared", Snackbar.LENGTH_SHORT).show()
        }
    }

    private fun applyTheme() {
        val theme = ThemeUtils.getCurrentTheme(this)
        window.statusBarColor = theme.bgPrimary
        window.navigationBarColor = theme.bgPrimary
        val rootView = findViewById<View>(android.R.id.content)
        rootView.setBackgroundColor(theme.bgPrimary)
    }

    override fun onBackPressed() {
        super.onBackPressed()
        overridePendingTransition(android.R.anim.fade_in, R.anim.slide_out_down)
    }
}
