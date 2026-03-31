package com.corrodedproxy.v2.utils

import android.content.Context
import android.view.View
import com.corrodedproxy.v2.R
import com.corrodedproxy.v2.managers.PreferenceManager
import com.corrodedproxy.v2.models.BrowserTheme

object ThemeUtils {

    fun getCurrentTheme(context: Context): BrowserTheme {
        val prefs = PreferenceManager(context)
        return getThemeByName(context, prefs.theme)
    }

    fun getThemeByName(context: Context, name: String): BrowserTheme {
        return when (name) {
            "Earth" -> BrowserTheme.earth(context)
            "Virellus" -> BrowserTheme.virellus(context)
            "Neptune" -> BrowserTheme.neptune(context)
            "Mars" -> BrowserTheme.mars(context)
            "Solar" -> BrowserTheme.solar(context)
            else -> BrowserTheme.earth(context)
        }
    }

    fun applyTheme(context: Context, vararg views: View, themeName: String? = null) {
        val theme = if (themeName != null) getThemeByName(context, themeName)
        else getCurrentTheme(context)
        for (view in views) {
            view.setBackgroundColor(theme.bgPrimary)
        }
    }

    fun getAllThemeNames(): List<String> = listOf("Earth", "Virellus", "Neptune", "Mars", "Solar")

    fun getThemeAccentColor(context: Context): Int {
        return getCurrentTheme(context).accent
    }
}
