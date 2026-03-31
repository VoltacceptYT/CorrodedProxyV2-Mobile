package com.corrodedproxy.v2.activities

import android.animation.ObjectAnimator
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.view.animation.AnimationUtils
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.webkit.WebView
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.isVisible
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.corrodedproxy.v2.R
import com.corrodedproxy.v2.adapters.DownloadAdapter
import com.corrodedproxy.v2.adapters.TabAdapter
import com.corrodedproxy.v2.managers.*
import com.corrodedproxy.v2.models.BrowserTab
import com.corrodedproxy.v2.models.DownloadItem
import com.corrodedproxy.v2.utils.ThemeUtils
import com.corrodedproxy.v2.utils.UrlUtils
import com.google.android.material.snackbar.Snackbar

class MainActivity : AppCompatActivity() {

    // Managers
    private lateinit var tabManager: TabManager
    private lateinit var historyManager: HistoryManager
    private lateinit var bookmarkManager: BookmarkManager
    private lateinit var downloadManager: DownloadManager
    private lateinit var prefManager: PreferenceManager

    // Views
    private lateinit var tabRecycler: RecyclerView
    private lateinit var btnAddTab: ImageButton
    private lateinit var btnTabCount: ImageButton
    private lateinit var searchBar: EditText
    private lateinit var searchIcon: ImageView
    private lateinit var btnHome: ImageButton
    private lateinit var btnBack: ImageButton
    private lateinit var btnForward: ImageButton
    private lateinit var btnReload: ImageButton
    private lateinit var btnMenu: ImageButton
    private lateinit var progressBar: ProgressBar
    private lateinit var webviewContainer: FrameLayout
    private lateinit var newTabPage: View
    private lateinit var newTabSearch: EditText
    private lateinit var findBar: LinearLayout
    private lateinit var findInput: EditText
    private lateinit var findResultsCount: TextView
    private lateinit var btnFindPrev: ImageButton
    private lateinit var btnFindNext: ImageButton
    private lateinit var btnFindClose: ImageButton
    private lateinit var contextMenuContainer: LinearLayout
    private lateinit var downloadBar: LinearLayout
    private lateinit var tabBar: LinearLayout
    private lateinit var navBar: LinearLayout
    private lateinit var splashText: TextView

    // Adapters
    private lateinit var tabAdapter: TabAdapter
    private lateinit var downloadAdapter: DownloadAdapter

    private var activeWebView: WebView? = null
    private var findActionMode: android.webkit.WebView.FindListener? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, true)
        window.statusBarColor = getColor(R.color.background_primary)
        window.navigationBarColor = getColor(R.color.background_primary)
        setContentView(R.layout.activity_main)

        prefManager = PreferenceManager(this)
        tabManager = TabManager(this)
        historyManager = HistoryManager(this)
        bookmarkManager = BookmarkManager(this)
        downloadManager = DownloadManager(this)

        bindViews()
        setupTabRecycler()
        setupDownloadBar()
        setupSearchBar()
        setupNavButtons()
        setupContextMenu()
        setupFindBar()
        applyTheme()
        setupTabManager()
        setupDownloadManager()

        tabManager.createTab()
        handleIncomingIntent(intent)
    }

    private fun bindViews() {
        tabRecycler = findViewById(R.id.tab_recycler)
        btnAddTab = findViewById(R.id.btn_add_tab)
        btnTabCount = findViewById(R.id.btn_tab_count)
        searchBar = findViewById(R.id.search_bar)
        searchIcon = findViewById(R.id.search_icon)
        btnHome = findViewById(R.id.btn_home)
        btnBack = findViewById(R.id.btn_back)
        btnForward = findViewById(R.id.btn_forward)
        btnReload = findViewById(R.id.btn_reload)
        btnMenu = findViewById(R.id.btn_menu)
        progressBar = findViewById(R.id.progress_bar)
        webviewContainer = findViewById(R.id.webview_container)
        newTabPage = findViewById(R.id.new_tab_page)
        newTabSearch = newTabPage.findViewById(R.id.new_tab_search)
        splashText = newTabPage.findViewById(R.id.splash_text)
        findBar = findViewById(R.id.find_bar)
        findInput = findViewById(R.id.find_input)
        findResultsCount = findViewById(R.id.find_results_count)
        btnFindPrev = findViewById(R.id.btn_find_prev)
        btnFindNext = findViewById(R.id.btn_find_next)
        btnFindClose = findViewById(R.id.btn_find_close)
        contextMenuContainer = findViewById(R.id.context_menu)
        downloadBar = findViewById(R.id.download_bar)
        tabBar = findViewById(R.id.tab_bar)
        navBar = findViewById(R.id.nav_bar)

        splashText.text = getSplashText()
    }

    private fun getSplashText(): String {
        val splashPhrases = listOf(
            "Browse freely.",
            "Your privacy, your rules.",
            "Corroded by design.",
            "No tracking. No BS.",
            "Fast. Private. Yours."
        )
        return splashPhrases.random()
    }

    private fun setupTabRecycler() {
        tabAdapter = TabAdapter(
            mutableListOf(),
            onTabClick = { index -> tabManager.switchToTab(index) },
            onTabClose = { index -> tabManager.closeTab(index) }
        )
        tabRecycler.apply {
            layoutManager = LinearLayoutManager(this@MainActivity, LinearLayoutManager.HORIZONTAL, false)
            adapter = tabAdapter
            itemAnimator = null
        }
        btnAddTab.setOnClickListener {
            tabManager.createTab()
            showNewTabPage()
        }
        btnTabCount.setOnClickListener {
            tabManager.createTab()
        }
    }

    private fun setupDownloadBar() {
        downloadAdapter = DownloadAdapter(
            mutableListOf(),
            onCancel = { id -> downloadManager.cancelDownload(id) }
        )
        val downloadsListView = downloadBar.findViewById<RecyclerView>(R.id.downloads_list)
        downloadsListView?.apply {
            layoutManager = LinearLayoutManager(this@MainActivity)
            adapter = downloadAdapter
        }
        downloadBar.findViewById<ImageButton>(R.id.btn_toggle_downloads)?.setOnClickListener {
            downloadsListView?.isVisible = downloadsListView?.isVisible != true
        }
    }

    private fun setupSearchBar() {
        searchBar.setOnEditorActionListener { _, actionId, event ->
            if (actionId == EditorInfo.IME_ACTION_GO ||
                (event?.keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_DOWN)
            ) {
                val input = searchBar.text?.toString()?.trim() ?: ""
                navigateTo(input)
                hideKeyboard()
                true
            } else false
        }
        searchBar.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus) {
                searchBar.selectAll()
            }
        }
        searchBar.setOnTouchListener { v, event ->
            if (event.action == MotionEvent.ACTION_UP) {
                searchBar.requestFocus()
                showKeyboard()
            }
            false
        }

        newTabSearch.setOnEditorActionListener { _, actionId, event ->
            if (actionId == EditorInfo.IME_ACTION_GO ||
                (event?.keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_DOWN)
            ) {
                val input = newTabSearch.text?.toString()?.trim() ?: ""
                navigateTo(input)
                hideKeyboard()
                true
            } else false
        }
    }

    private fun setupNavButtons() {
        btnHome.setOnClickListener { showNewTabPage() }
        btnBack.setOnClickListener {
            activeWebView?.let { wv ->
                if (wv.canGoBack()) wv.goBack()
            }
        }
        btnForward.setOnClickListener {
            activeWebView?.let { wv ->
                if (wv.canGoForward()) wv.goForward()
            }
        }
        btnReload.setOnClickListener {
            val tab = tabManager.getActiveTab()
            if (tab?.isLoading == true) {
                activeWebView?.stopLoading()
            } else {
                activeWebView?.reload()
            }
        }
        btnMenu.setOnClickListener { showContextMenu(btnMenu) }
    }

    private fun setupContextMenu() {
        contextMenuContainer.apply {
            val menuBack = findViewById<LinearLayout>(R.id.menu_item_back)
            val menuForward = findViewById<LinearLayout>(R.id.menu_item_forward)
            val menuReload = findViewById<LinearLayout>(R.id.menu_item_reload)
            val menuShare = findViewById<LinearLayout>(R.id.menu_item_share)
            val menuCopyLink = findViewById<LinearLayout>(R.id.menu_item_copy_link)
            val menuFind = findViewById<LinearLayout>(R.id.menu_item_find)
            val menuNewTab = findViewById<LinearLayout>(R.id.menu_item_new_tab)
            val menuBookmark = findViewById<LinearLayout>(R.id.menu_item_bookmark)
            val menuSettings = findViewById<LinearLayout>(R.id.menu_item_settings)

            menuBack?.setOnClickListener {
                activeWebView?.goBack(); hideContextMenu()
            }
            menuForward?.setOnClickListener {
                activeWebView?.goForward(); hideContextMenu()
            }
            menuReload?.setOnClickListener {
                activeWebView?.reload(); hideContextMenu()
            }
            menuShare?.setOnClickListener {
                shareCurrentPage(); hideContextMenu()
            }
            menuCopyLink?.setOnClickListener {
                copyCurrentUrl(); hideContextMenu()
            }
            menuFind?.setOnClickListener {
                showFindBar(); hideContextMenu()
            }
            menuNewTab?.setOnClickListener {
                tabManager.createTab(); showNewTabPage(); hideContextMenu()
            }
            menuBookmark?.setOnClickListener {
                addCurrentBookmark(); hideContextMenu()
            }
            menuSettings?.setOnClickListener {
                openSettings(); hideContextMenu()
            }
        }

        val rootView = window.decorView
        rootView.setOnTouchListener { _, event ->
            if (event.action == MotionEvent.ACTION_DOWN && contextMenuContainer.isVisible) {
                val loc = IntArray(2)
                contextMenuContainer.getLocationOnScreen(loc)
                val x = event.rawX
                val y = event.rawY
                if (x < loc[0] || x > loc[0] + contextMenuContainer.width ||
                    y < loc[1] || y > loc[1] + contextMenuContainer.height
                ) {
                    hideContextMenu()
                }
            }
            false
        }
    }

    private fun setupFindBar() {
        findInput.setOnEditorActionListener { _, _, _ ->
            val query = findInput.text?.toString() ?: ""
            activeWebView?.findAllAsync(query)
            true
        }
        findInput.addTextChangedListener(object : android.text.TextWatcher {
            override fun afterTextChanged(s: android.text.Editable?) {
                val query = s?.toString() ?: ""
                if (query.isNotEmpty()) {
                    activeWebView?.findAllAsync(query)
                } else {
                    activeWebView?.clearMatches()
                    findResultsCount.text = ""
                }
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })
        btnFindPrev.setOnClickListener {
            activeWebView?.findNext(false)
        }
        btnFindNext.setOnClickListener {
            activeWebView?.findNext(true)
        }
        btnFindClose.setOnClickListener {
            hideFindBar()
        }
    }

    private fun setupTabManager() {
        tabManager.addListener(object : TabManager.TabListener {
            override fun onTabAdded(tab: BrowserTab, index: Int) {
                refreshTabList()
            }
            override fun onTabRemoved(tab: BrowserTab, index: Int) {
                refreshTabList()
            }
            override fun onTabSwitched(tab: BrowserTab, index: Int) {
                switchActiveTab(tab, index)
            }
            override fun onTabUpdated(tab: BrowserTab) {
                if (tab.id == tabManager.getActiveTab()?.id) {
                    updateNavState(tab)
                }
                refreshTabList()
            }
            override fun onTabCountChanged(count: Int) {
                updateTabCount(count)
            }
        })
    }

    private fun setupDownloadManager() {
        downloadManager.addListener(object : DownloadManager.DownloadListener {
            override fun onDownloadStarted(item: DownloadItem) {
                runOnUiThread {
                    downloadBar.visibility = View.VISIBLE
                    downloadAdapter.updateDownloads(downloadManager.getDownloads())
                    Snackbar.make(
                        window.decorView.rootView,
                        "Downloading: ${item.filename}",
                        Snackbar.LENGTH_SHORT
                    ).show()
                }
            }
            override fun onDownloadProgress(item: DownloadItem) {
                runOnUiThread { downloadAdapter.updateDownloads(downloadManager.getDownloads()) }
            }
            override fun onDownloadCompleted(item: DownloadItem) {
                runOnUiThread {
                    downloadAdapter.updateDownloads(downloadManager.getDownloads())
                    Snackbar.make(
                        window.decorView.rootView,
                        "${item.filename} downloaded",
                        Snackbar.LENGTH_LONG
                    ).show()
                }
            }
            override fun onDownloadFailed(item: DownloadItem) {
                runOnUiThread {
                    downloadAdapter.updateDownloads(downloadManager.getDownloads())
                }
            }
        })
    }

    private fun switchActiveTab(tab: BrowserTab, index: Int) {
        webviewContainer.removeAllViews()
        newTabPage.visibility = View.GONE
        if (tab.url.isEmpty() || tab.url == "about:blank") {
            webviewContainer.addView(newTabPage)
            newTabPage.visibility = View.VISIBLE
        } else {
            tab.webView?.let { wv ->
                webviewContainer.addView(wv)
            }
        }
        activeWebView = tab.webView
        updateNavState(tab)
        refreshTabList()
        tabAdapter.setActiveIndex(index)
        tabRecycler.smoothScrollToPosition(index)
    }

    private fun updateNavState(tab: BrowserTab) {
        runOnUiThread {
            val displayUrl = if (tab.url.isEmpty() || tab.url == "about:blank") ""
            else UrlUtils.getDisplayUrl(tab.url)
            if (!searchBar.hasFocus()) {
                searchBar.setText(displayUrl)
            }

            btnBack.alpha = if (activeWebView?.canGoBack() == true) 1.0f else 0.4f
            btnForward.alpha = if (activeWebView?.canGoForward() == true) 1.0f else 0.4f

            if (tab.isLoading) {
                progressBar.visibility = View.VISIBLE
                val anim = ObjectAnimator.ofInt(progressBar, "progress", progressBar.progress, tab.progress)
                anim.duration = 200
                anim.start()
                btnReload.setImageResource(R.drawable.ic_stop)
            } else {
                progressBar.visibility = View.GONE
                progressBar.progress = 0
                btnReload.setImageResource(R.drawable.ic_refresh)
            }

            searchIcon.setImageResource(
                if (UrlUtils.isSecure(tab.url)) R.drawable.ic_lock else R.drawable.ic_search
            )
        }
    }

    private fun refreshTabList() {
        runOnUiThread {
            tabAdapter.updateTabs(
                tabManager.getAllTabs().toMutableList(),
                tabManager.getActiveIndex()
            )
        }
    }

    private fun updateTabCount(count: Int) {
        runOnUiThread {
            btnTabCount.contentDescription = "$count tabs"
        }
    }

    private fun navigateTo(input: String) {
        if (input.isBlank()) return
        val url = TabManager.resolveUrl(input, prefManager.searchEngine)
        val tab = tabManager.getActiveTab()
        if (tab != null) {
            if (tab.url.isEmpty() || tab.url == "about:blank") {
                webviewContainer.removeAllViews()
                newTabPage.visibility = View.GONE
                tab.webView?.let { webviewContainer.addView(it) }
                activeWebView = tab.webView
            }
            historyManager.addEntry(input, url)
            tab.webView?.loadUrl(url)
            searchBar.setText(UrlUtils.getDisplayUrl(url))
        }
        searchBar.clearFocus()
        hideKeyboard()
    }

    private fun showNewTabPage() {
        webviewContainer.removeAllViews()
        newTabPage.visibility = View.GONE
        webviewContainer.addView(newTabPage)
        newTabPage.visibility = View.VISIBLE
        searchBar.setText("")
        newTabSearch.setText("")
        newTabSearch.requestFocus()
        showKeyboard()
    }

    private fun showContextMenu(anchor: View) {
        contextMenuContainer.visibility = View.VISIBLE
        val anim = AnimationUtils.loadAnimation(this, R.anim.context_menu_in)
        contextMenuContainer.startAnimation(anim)
        contextMenuContainer.bringToFront()
    }

    private fun hideContextMenu() {
        val anim = AnimationUtils.loadAnimation(this, R.anim.context_menu_out)
        contextMenuContainer.startAnimation(anim)
        contextMenuContainer.visibility = View.GONE
    }

    private fun showFindBar() {
        findBar.visibility = View.VISIBLE
        findInput.requestFocus()
        showKeyboard()
    }

    private fun hideFindBar() {
        findBar.visibility = View.GONE
        activeWebView?.clearMatches()
        findInput.setText("")
        findResultsCount.text = ""
        hideKeyboard()
    }

    private fun shareCurrentPage() {
        val tab = tabManager.getActiveTab() ?: return
        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, tab.url)
            putExtra(Intent.EXTRA_SUBJECT, tab.title)
        }
        startActivity(Intent.createChooser(shareIntent, "Share via"))
    }

    private fun copyCurrentUrl() {
        val tab = tabManager.getActiveTab() ?: return
        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        clipboard.setPrimaryClip(ClipData.newPlainText("URL", tab.url))
        Snackbar.make(window.decorView.rootView, "Link copied", Snackbar.LENGTH_SHORT).show()
    }

    private fun addCurrentBookmark() {
        val tab = tabManager.getActiveTab() ?: return
        if (tab.url.isEmpty()) return
        val added = bookmarkManager.addBookmark(tab.title, tab.url)
        val msg = if (added) getString(R.string.bookmark_added) else getString(R.string.bookmark_removed)
        Snackbar.make(window.decorView.rootView, msg, Snackbar.LENGTH_SHORT).show()
    }

    private fun openSettings() {
        val intent = Intent(this, SettingsActivity::class.java)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_in_up, android.R.anim.fade_out)
    }

    private fun applyTheme() {
        val theme = ThemeUtils.getCurrentTheme(this)
        tabBar.setBackgroundColor(theme.bgPrimary)
        navBar.setBackgroundColor(theme.bgSecondary)
        window.statusBarColor = theme.bgPrimary
        window.navigationBarColor = theme.bgPrimary
    }

    private fun showKeyboard() {
        val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        val focused = currentFocus ?: window.decorView
        imm.showSoftInput(focused, InputMethodManager.SHOW_IMPLICIT)
    }

    private fun hideKeyboard() {
        val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        val focused = currentFocus ?: window.decorView
        imm.hideSoftInputFromWindow(focused.windowToken, 0)
    }

    private fun handleIncomingIntent(intent: Intent?) {
        if (intent?.action == Intent.ACTION_VIEW) {
            val url = intent.dataString ?: return
            tabManager.getActiveTab()?.webView?.loadUrl(url)
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIncomingIntent(intent)
    }

    override fun onResume() {
        super.onResume()
        applyTheme()
        tabManager.getActiveTab()?.webView?.onResume()
    }

    override fun onPause() {
        super.onPause()
        tabManager.getActiveTab()?.webView?.onPause()
    }

    override fun onBackPressed() {
        when {
            findBar.isVisible -> {
                hideFindBar()
                return
            }
            contextMenuContainer.isVisible -> {
                hideContextMenu()
                return
            }
            activeWebView?.canGoBack() == true -> {
                activeWebView?.goBack()
                return
            }
            else -> super.onBackPressed()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        tabManager.closeAllTabs()
    }
}
