package com.voltaccept.corrodedproxy.v2

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Build
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.inputmethod.EditorInfo
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.EditText
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.PopupWindow
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.ImageView
import android.widget.Toast

class MainActivity : AppCompatActivity() {
    
    private lateinit var webView: WebView
    private lateinit var urlBar: EditText
    private lateinit var tabsLayout: LinearLayout
    private lateinit var webViewContainer: FrameLayout
    private lateinit var addTabBtn: ImageButton
    private lateinit var settingsBtn: ImageButton
    private lateinit var homeBtn: ImageButton
    private lateinit var backBtn: ImageButton
    private lateinit var forwardBtn: ImageButton
    private lateinit var reloadBtn: ImageButton
    private lateinit var contextMenuPopup: PopupWindow
    
    private val tabs = mutableListOf<TabData>()
    private var currentTabIndex = 0
    
    data class TabData(
        val webView: WebView,
        val tabView: View,
        var title: String = "New Tab",
        var url: String = "about:blank"
    )
    
    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        initializeViews()
        setupWebView()
        setupClickListeners()
        setupUrlBar()
        setupContextMenu()
        
        // Create initial tab
        addNewTab()
    }
    
    private fun initializeViews() {
        webView = findViewById(R.id.webview)
        urlBar = findViewById(R.id.url_bar)
        tabsLayout = findViewById(R.id.tabs_layout)
        webViewContainer = findViewById(R.id.webview_container)
        addTabBtn = findViewById(R.id.add_tab_btn)
        settingsBtn = findViewById(R.id.settings_btn)
        homeBtn = findViewById(R.id.home_btn)
        backBtn = findViewById(R.id.back_btn)
        forwardBtn = findViewById(R.id.forward_btn)
        reloadBtn = findViewById(R.id.reload_btn)
    }
    
    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.loadWithOverviewMode = true
        webView.settings.useWideViewPort = true
        webView.webViewClient = WebViewClient()
        webView.webChromeClient = WebChromeClient()
    }
    
    private fun setupClickListeners() {
        addTabBtn.setOnClickListener {
            addNewTab()
        }
        
        settingsBtn.setOnClickListener {
            val intent = Intent(this, SettingsActivity::class.java)
            startActivity(intent)
        }
        
        homeBtn.setOnClickListener {
            getCurrentWebView()?.loadUrl("about:blank")
        }
        
        backBtn.setOnClickListener {
            getCurrentWebView()?.goBack()
        }
        
        forwardBtn.setOnClickListener {
            getCurrentWebView()?.goForward()
        }
        
        reloadBtn.setOnClickListener {
            getCurrentWebView()?.reload()
        }
    }
    
    private fun setupUrlBar() {
        urlBar.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_GO) {
                loadUrl(urlBar.text.toString())
                true
            } else {
                false
            }
        }
    }
    
    private fun addNewTab() {
        val newWebView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.loadWithOverviewMode = true
            settings.useWideViewPort = true
            
            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    updateTabInfo(tabs.indexOfFirst { it.webView == view }, view?.title ?: "New Tab", url ?: "about:blank")
                    if (view == getCurrentWebView()) {
                        urlBar.setText(url)
                    }
                }
                
                override fun onReceivedError(view: WebView?, errorCode: Int, description: String?, failingUrl: String?) {
                    super.onReceivedError(view, errorCode, description, failingUrl)
                    updateTabInfo(tabs.indexOfFirst { it.webView == view }, "Error", failingUrl ?: "about:blank")
                }
            }
            
            webChromeClient = WebChromeClient()
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        }
        
        val tabView = createTabView()
        val tabIndex = tabs.size
        
        val tabData = TabData(newWebView, tabView)
        tabs.add(tabData)
        
        tabView.setOnClickListener {
            switchToTab(tabIndex)
        }
        
        tabView.findViewById<ImageButton>(R.id.tab_close).setOnClickListener {
            closeTab(tabIndex)
        }
        
        tabsLayout.addView(tabView)
        webViewContainer.addView(newWebView)
        
        newWebView.visibility = View.GONE
        
        switchToTab(tabIndex)
        
        // Load home page for new tab
        newWebView.loadUrl("about:blank")
    }
    
    private fun createTabView(): View {
        val inflater = LayoutInflater.from(this)
        return inflater.inflate(R.layout.tab_item, tabsLayout, false)
    }
    
    private fun switchToTab(index: Int) {
        if (index < 0 || index >= tabs.size) return
        
        // Hide current webview
        getCurrentWebView()?.visibility = View.GONE
        
        // Update tab appearance
        tabs.forEachIndexed { i, tab ->
            val isActive = i == index
            tab.tabView.setBackgroundColor(if (isActive) Color.parseColor("#444") else Color.parseColor("#353535"))
            tab.tabView.findViewById<ImageButton>(R.id.tab_close).visibility = if (isActive) View.VISIBLE else View.GONE
        }
        
        // Show new webview
        currentTabIndex = index
        getCurrentWebView()?.visibility = View.VISIBLE
        
        // Update URL bar
        val currentTab = tabs[currentTabIndex]
        urlBar.setText(if (currentTab.url == "about:blank") "" else currentTab.url)
    }
    
    private fun closeTab(index: Int) {
        if (index < 0 || index >= tabs.size) return
        
        if (tabs.size == 1) {
            // Don't close the last tab, just reset it
            tabs[index].webView.loadUrl("about:blank")
            return
        }
        
        val tabToRemove = tabs[index]
        
        // Remove views
        tabsLayout.removeView(tabToRemove.tabView)
        webViewContainer.removeView(tabToRemove.webView)
        
        // Remove from list
        tabs.removeAt(index)
        
        // Adjust current tab index if needed
        if (currentTabIndex >= index) {
            currentTabIndex = maxOf(0, currentTabIndex - 1)
        }
        
        // Switch to another tab
        if (tabs.isNotEmpty()) {
            switchToTab(currentTabIndex)
        }
    }
    
    private fun updateTabInfo(index: Int, title: String, url: String) {
        if (index < 0 || index >= tabs.size) return
        
        val tab = tabs[index]
        tab.title = title
        tab.url = url
        
        val titleTextView = tab.tabView.findViewById<TextView>(R.id.tab_title)
        titleTextView.text = title.ifEmpty { "New Tab" }
    }
    
    private fun getCurrentWebView(): WebView? {
        return if (currentTabIndex < tabs.size) tabs[currentTabIndex].webView else null
    }
    
    private fun loadUrl(url: String) {
        val finalUrl = if (url.startsWith("http://") || url.startsWith("https://")) {
            url
        } else if (url.contains(" ") || !url.contains(".")) {
            // Treat as search query
            "https://www.google.com/search?q=${url.replace(" ", "+")}"
        } else {
            "https://$url"
        }
        
        getCurrentWebView()?.loadUrl(finalUrl)
    }
    
    override fun onBackPressed() {
        if (getCurrentWebView()?.canGoBack() == true) {
            getCurrentWebView()?.goBack()
        } else {
            super.onBackPressed()
        }
    }
    
    private fun setupContextMenu() {
        val inflater = LayoutInflater.from(this)
        val contextMenuView = inflater.inflate(R.layout.context_menu, null)
        
        contextMenuPopup = PopupWindow(
            contextMenuView,
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT,
            true
        )
        
        // Set up context menu click listeners
        contextMenuView.findViewById<View>(R.id.context_back).setOnClickListener {
            getCurrentWebView()?.goBack()
            contextMenuPopup.dismiss()
        }
        
        contextMenuView.findViewById<View>(R.id.context_forward).setOnClickListener {
            getCurrentWebView()?.goForward()
            contextMenuPopup.dismiss()
        }
        
        contextMenuView.findViewById<View>(R.id.context_reload).setOnClickListener {
            getCurrentWebView()?.reload()
            contextMenuPopup.dismiss()
        }
        
        contextMenuView.findViewById<View>(R.id.context_inspect).setOnClickListener {
            Toast.makeText(this, "Inspect - Coming Soon", Toast.LENGTH_SHORT).show()
            contextMenuPopup.dismiss()
        }
        
        contextMenuView.findViewById<View>(R.id.context_settings).setOnClickListener {
            val intent = Intent(this, SettingsActivity::class.java)
            startActivity(intent)
            contextMenuPopup.dismiss()
        }
        
        // Set up long press listener for webview to show context menu
        webView.setOnLongClickListener { view ->
            val location = IntArray(2)
            view.getLocationOnScreen(location)
            showContextMenu(location[0] + view.width / 2, location[1] + view.height / 2)
            true
        }
    }
    
    private fun showContextMenu(x: Int, y: Int) {
        contextMenuPopup.showAtLocation(findViewById(android.R.id.content), Gravity.NO_GRAVITY, x - 100, y - 100)
    }
}
