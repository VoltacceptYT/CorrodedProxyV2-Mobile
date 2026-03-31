package com.corrodedproxy.v2.utils

object UrlUtils {

    fun isValidUrl(url: String): Boolean {
        return url.startsWith("http://") ||
                url.startsWith("https://") ||
                url.startsWith("file://") ||
                url.startsWith("about:")
    }

    fun getDisplayUrl(url: String): String {
        return url
            .removePrefix("https://")
            .removePrefix("http://")
            .removePrefix("www.")
            .let { if (it.endsWith("/")) it.dropLast(1) else it }
    }

    fun isSecure(url: String): Boolean = url.startsWith("https://")

    fun getHostname(url: String): String {
        return try {
            java.net.URL(url).host
        } catch (e: Exception) {
            url
        }
    }

    fun getFaviconUrl(url: String): String {
        val host = getHostname(url)
        return "https://www.google.com/s2/favicons?domain=$host&sz=32"
    }
}
