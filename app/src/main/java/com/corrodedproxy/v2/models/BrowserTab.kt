package com.corrodedproxy.v2.models

import android.webkit.WebView

data class BrowserTab(
    val id: String,
    var title: String = "New Tab",
    var url: String = "",
    var favicon: android.graphics.Bitmap? = null,
    var isLoading: Boolean = false,
    var progress: Int = 0,
    var isIncognito: Boolean = false,
    var webView: WebView? = null
)
