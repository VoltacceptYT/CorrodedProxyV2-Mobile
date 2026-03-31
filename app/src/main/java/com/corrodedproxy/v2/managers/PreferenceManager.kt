package com.corrodedproxy.v2.managers

import android.content.Context
import android.content.SharedPreferences
import com.corrodedproxy.v2.models.SearchEngine

class PreferenceManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREF_NAME = "corroded_prefs"
        private const val KEY_SEARCH_ENGINE = "search_engine"
        private const val KEY_THEME = "theme"
        private const val KEY_JAVASCRIPT_ENABLED = "javascript_enabled"
        private const val KEY_COOKIES_ENABLED = "cookies_enabled"
        private const val KEY_NO_REFERRER = "no_referrer"
        private const val KEY_DESKTOP_MODE = "desktop_mode"
        private const val KEY_HOMEPAGE = "homepage"
        private const val KEY_HISTORY = "history"
        private const val KEY_BOOKMARKS = "bookmarks"
        private const val KEY_QUICK_LINKS = "quick_links"
        private const val KEY_FIRST_LAUNCH = "first_launch"
    }

    var searchEngine: SearchEngine
        get() {
            val name = prefs.getString(KEY_SEARCH_ENGINE, SearchEngine.DUCKDUCKGO.name)
            return try {
                SearchEngine.valueOf(name ?: SearchEngine.DUCKDUCKGO.name)
            } catch (e: IllegalArgumentException) {
                SearchEngine.DUCKDUCKGO
            }
        }
        set(value) = prefs.edit().putString(KEY_SEARCH_ENGINE, value.name).apply()

    var theme: String
        get() = prefs.getString(KEY_THEME, "Earth") ?: "Earth"
        set(value) = prefs.edit().putString(KEY_THEME, value).apply()

    var isJavaScriptEnabled: Boolean
        get() = prefs.getBoolean(KEY_JAVASCRIPT_ENABLED, true)
        set(value) = prefs.edit().putBoolean(KEY_JAVASCRIPT_ENABLED, value).apply()

    var isCookiesEnabled: Boolean
        get() = prefs.getBoolean(KEY_COOKIES_ENABLED, true)
        set(value) = prefs.edit().putBoolean(KEY_COOKIES_ENABLED, value).apply()

    var isNoReferrer: Boolean
        get() = prefs.getBoolean(KEY_NO_REFERRER, true)
        set(value) = prefs.edit().putBoolean(KEY_NO_REFERRER, value).apply()

    var isDesktopMode: Boolean
        get() = prefs.getBoolean(KEY_DESKTOP_MODE, false)
        set(value) = prefs.edit().putBoolean(KEY_DESKTOP_MODE, value).apply()

    var homepage: String
        get() = prefs.getString(KEY_HOMEPAGE, "") ?: ""
        set(value) = prefs.edit().putString(KEY_HOMEPAGE, value).apply()

    var isFirstLaunch: Boolean
        get() = prefs.getBoolean(KEY_FIRST_LAUNCH, true)
        set(value) = prefs.edit().putBoolean(KEY_FIRST_LAUNCH, value).apply()

    fun saveHistory(json: String) = prefs.edit().putString(KEY_HISTORY, json).apply()
    fun loadHistory(): String = prefs.getString(KEY_HISTORY, "[]") ?: "[]"

    fun saveBookmarks(json: String) = prefs.edit().putString(KEY_BOOKMARKS, json).apply()
    fun loadBookmarks(): String = prefs.getString(KEY_BOOKMARKS, "[]") ?: "[]"

    fun saveQuickLinks(json: String) = prefs.edit().putString(KEY_QUICK_LINKS, json).apply()
    fun loadQuickLinks(): String = prefs.getString(KEY_QUICK_LINKS, "[]") ?: "[]"
}
