package com.corrodedproxy.v2.managers

import android.content.Context
import com.corrodedproxy.v2.models.BookmarkItem
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

class BookmarkManager(private val context: Context) {

    private val prefManager = PreferenceManager(context)
    private val gson = Gson()
    private val bookmarks = mutableListOf<BookmarkItem>()

    init {
        loadBookmarks()
    }

    private fun loadBookmarks() {
        try {
            val json = prefManager.loadBookmarks()
            val type = object : TypeToken<List<BookmarkItem>>() {}.type
            val loaded: List<BookmarkItem> = gson.fromJson(json, type) ?: emptyList()
            bookmarks.clear()
            bookmarks.addAll(loaded)
        } catch (e: Exception) {
            bookmarks.clear()
        }
    }

    fun addBookmark(title: String, url: String): Boolean {
        if (isBookmarked(url)) return false
        bookmarks.add(0, BookmarkItem(title = title.ifEmpty { url }, url = url))
        saveBookmarks()
        return true
    }

    fun removeBookmark(url: String): Boolean {
        val removed = bookmarks.removeAll { it.url == url }
        if (removed) saveBookmarks()
        return removed
    }

    fun isBookmarked(url: String): Boolean = bookmarks.any { it.url == url }

    fun getAll(): List<BookmarkItem> = bookmarks.toList()

    fun clearAll() {
        bookmarks.clear()
        saveBookmarks()
    }

    private fun saveBookmarks() {
        prefManager.saveBookmarks(gson.toJson(bookmarks))
    }
}
