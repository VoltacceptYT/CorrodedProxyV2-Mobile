package com.corrodedproxy.v2.managers

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Bitmap
import android.net.http.SslError
import android.os.Build
import android.os.Message
import android.util.Log
import android.view.View
import android.webkit.*
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewFeature
import com.corrodedproxy.v2.models.BrowserTab
import com.corrodedproxy.v2.models.SearchEngine
import java.util.UUID

class TabManager(private val context: Context) {

    private val tabs = mutableListOf<BrowserTab>()
    private var activeTabIndex = -1
    private val listeners = mutableListOf<TabListener>()

    interface TabListener {
        fun onTabAdded(tab: BrowserTab, index: Int)
        fun onTabRemoved(tab: BrowserTab, index: Int)
        fun onTabSwitched(tab: BrowserTab, index: Int)
        fun onTabUpdated(tab: BrowserTab)
        fun onTabCountChanged(count: Int)
    }

    fun addListener(l: TabListener) = listeners.add(l)
    fun removeListener(l: TabListener) = listeners.remove(l)

    fun getActiveTab(): BrowserTab? = tabs.getOrNull(activeTabIndex)
    fun getActiveIndex(): Int = activeTabIndex
    fun getAllTabs(): List<BrowserTab> = tabs.toList()
    fun getTabCount(): Int = tabs.size

    fun createTab(url: String = "", isIncognito: Boolean = false): BrowserTab {
        val tab = BrowserTab(
            id = UUID.randomUUID().toString(),
            isIncognito = isIncognito
        )
        tab.webView = createWebView(tab)
        tabs.add(tab)
        val index = tabs.size - 1
        listeners.forEach { it.onTabAdded(tab, index) }
        listeners.forEach { it.onTabCountChanged(tabs.size) }
        switchToTab(index)
        if (url.isNotEmpty()) {
            tab.webView?.loadUrl(url)
        }
        return tab
    }

    fun closeTab(index: Int) {
        if (index < 0 || index >= tabs.size) return
        val tab = tabs[index]
        tab.webView?.apply {
            stopLoading()
            loadUrl("about:blank")
            onPause()
            removeAllViews()
            destroy()
        }
        tab.webView = null
        tabs.removeAt(index)
        listeners.forEach { it.onTabRemoved(tab, index) }
        listeners.forEach { it.onTabCountChanged(tabs.size) }

        when {
            tabs.isEmpty() -> {
                activeTabIndex = -1
                createTab()
            }
            activeTabIndex >= tabs.size -> switchToTab(tabs.size - 1)
            activeTabIndex == index -> switchToTab(maxOf(0, activeTabIndex - 1))
        }
    }

    fun switchToTab(index: Int) {
        if (index < 0 || index >= tabs.size) return
        activeTabIndex = index
        val tab = tabs[index]
        listeners.forEach { it.onTabSwitched(tab, index) }
    }

    fun closeAllTabs() {
        val toClose = tabs.toList()
        for (tab in toClose) {
            tab.webView?.apply {
                stopLoading()
                loadUrl("about:blank")
                onPause()
                removeAllViews()
                destroy()
            }
        }
        tabs.clear()
        activeTabIndex = -1
        listeners.forEach { it.onTabCountChanged(0) }
        createTab()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun createWebView(tab: BrowserTab): WebView {
        val webView = WebView(context)
        webView.apply {
            layoutParams = android.view.ViewGroup.LayoutParams(
                android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                android.view.ViewGroup.LayoutParams.MATCH_PARENT
            )
            settings.apply {
                javaScriptEnabled = PreferenceManager(context).isJavaScriptEnabled
                domStorageEnabled = true
                databaseEnabled = true
                loadsImagesAutomatically = true
                allowFileAccess = false
                allowContentAccess = false
                setSupportZoom(true)
                builtInZoomControls = true
                displayZoomControls = false
                loadWithOverviewMode = true
                useWideViewPort = true
                mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
                mediaPlaybackRequiresUserGesture = false
                cacheMode = WebSettings.LOAD_DEFAULT
                saveFormData = !tab.isIncognito
                userAgentString = MOBILE_USER_AGENT
                javaScriptCanOpenWindowsAutomatically = true
                setSupportMultipleWindows(false)
                setGeolocationEnabled(false)
            }

            if (tab.isIncognito) {
                settings.saveFormData = false
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    settings.isAlgorithmicDarkeningAllowed = true
                }
            }

            if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
                WebSettingsCompat.setAlgorithmicDarkeningAllowed(settings, true)
            }

            if (WebViewFeature.isFeatureSupported(WebViewFeature.FORCE_DARK)) {
                @Suppress("DEPRECATION")
                WebSettingsCompat.setForceDark(settings, WebSettingsCompat.FORCE_DARK_ON)
            }

            webViewClient = CorrodedWebViewClient(tab)
            webChromeClient = CorrodedWebChromeClient(tab)
            setLayerType(View.LAYER_TYPE_HARDWARE, null)
        }
        return webView
    }

    private inner class CorrodedWebViewClient(private val tab: BrowserTab) : WebViewClient() {

        override fun onPageStarted(view: WebView, url: String, favicon: Bitmap?) {
            tab.url = url
            tab.isLoading = true
            tab.progress = 0
            listeners.forEach { it.onTabUpdated(tab) }
        }

        override fun onPageFinished(view: WebView, url: String) {
            tab.url = url
            tab.title = view.title ?: url
            tab.isLoading = false
            tab.progress = 100
            listeners.forEach { it.onTabUpdated(tab) }
        }

        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
            val url = request.url.toString()
            if (url.startsWith("http://") || url.startsWith("https://")) {
                return false
            }
            if (url.startsWith("intent://") || url.startsWith("market://")) {
                try {
                    val intent = android.content.Intent.parseUri(url, android.content.Intent.URI_INTENT_SCHEME)
                    context.startActivity(intent)
                } catch (e: Exception) {
                    Log.w("TabManager", "Cannot handle intent URI: $url")
                }
                return true
            }
            return true
        }

        override fun onReceivedSslError(view: WebView, handler: SslErrorHandler, error: SslError) {
            handler.cancel()
        }

        override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
            if (request.isForMainFrame) {
                tab.isLoading = false
                listeners.forEach { it.onTabUpdated(tab) }
            }
        }
    }

    private inner class CorrodedWebChromeClient(private val tab: BrowserTab) : WebChromeClient() {

        override fun onProgressChanged(view: WebView, newProgress: Int) {
            tab.progress = newProgress
            tab.isLoading = newProgress < 100
            listeners.forEach { it.onTabUpdated(tab) }
        }

        override fun onReceivedTitle(view: WebView, title: String) {
            tab.title = title
            listeners.forEach { it.onTabUpdated(tab) }
        }

        override fun onReceivedIcon(view: WebView, icon: Bitmap) {
            tab.favicon = icon
            listeners.forEach { it.onTabUpdated(tab) }
        }

        override fun onCreateWindow(
            view: WebView, isDialog: Boolean, isUserGesture: Boolean, resultMsg: Message
        ): Boolean {
            if (isUserGesture) {
                val newTab = createTab()
                val transport = resultMsg.obj as? WebView.WebViewTransport
                transport?.webView = newTab.webView
                resultMsg.sendToTarget()
            }
            return isUserGesture
        }
    }

    fun applyPreferences() {
        val prefs = PreferenceManager(context)
        for (tab in tabs) {
            tab.webView?.settings?.apply {
                javaScriptEnabled = prefs.isJavaScriptEnabled
            }
        }
    }

    fun clearCookies() {
        CookieManager.getInstance().removeAllCookies(null)
        CookieManager.getInstance().flush()
    }

    fun clearCache() {
        for (tab in tabs) {
            tab.webView?.clearCache(true)
        }
    }

    fun clearHistory() {
        for (tab in tabs) {
            tab.webView?.clearHistory()
        }
    }

    companion object {
        private const val MOBILE_USER_AGENT =
            "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36"

        fun resolveUrl(input: String, searchEngine: SearchEngine): String {
            val trimmed = input.trim()
            if (trimmed.isEmpty()) return ""
            if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed
            if (trimmed.startsWith("about:") || trimmed.startsWith("file://")) return trimmed
            val looksLikeUrl = !trimmed.contains(" ") && (
                    trimmed.contains(".") && !trimmed.startsWith(".") ||
                    trimmed.contains(":")
            )
            return if (looksLikeUrl) {
                "https://$trimmed"
            } else {
                searchEngine.buildSearchUrl(trimmed)
            }
        }
    }
}
