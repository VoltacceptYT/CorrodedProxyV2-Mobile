package com.corrodedproxy.v2.models

enum class SearchEngine(
    val displayName: String,
    val searchUrl: String,
    val homepageUrl: String
) {
    DUCKDUCKGO(
        "DuckDuckGo",
        "https://duckduckgo.com/?q=%s",
        "https://duckduckgo.com"
    ),
    GOOGLE(
        "Google",
        "https://www.google.com/search?q=%s",
        "https://www.google.com"
    ),
    BING(
        "Bing",
        "https://www.bing.com/search?q=%s",
        "https://www.bing.com"
    ),
    YAHOO(
        "Yahoo",
        "https://search.yahoo.com/search?p=%s",
        "https://www.yahoo.com"
    ),
    BRAVE(
        "Brave Search",
        "https://search.brave.com/search?q=%s",
        "https://search.brave.com"
    );

    fun buildSearchUrl(query: String): String {
        return String.format(searchUrl, java.net.URLEncoder.encode(query, "UTF-8"))
    }
}
