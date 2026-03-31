package com.corrodedproxy.v2.managers

import android.content.Context
import com.corrodedproxy.v2.models.HistoryItem
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

class HistoryManager(private val context: Context) {

    private val prefManager = PreferenceManager(context)
    private val gson = Gson()
    private val history = mutableListOf<HistoryItem>()
    private val maxHistorySize = 500

    init {
        loadHistory()
    }

    private fun loadHistory() {
        try {
            val json = prefManager.loadHistory()
            val type = object : TypeToken<List<HistoryItem>>() {}.type
            val loaded: List<HistoryItem> = gson.fromJson(json, type) ?: emptyList()
            history.clear()
            history.addAll(loaded)
        } catch (e: Exception) {
            history.clear()
        }
    }

    fun addEntry(title: String, url: String) {
        if (url.isEmpty() || url == "about:blank") return
        val item = HistoryItem(title = title.ifEmpty { url }, url = url)
        history.removeAll { it.url == url }
        history.add(0, item)
        if (history.size > maxHistorySize) {
            history.removeAt(history.size - 1)
        }
        saveHistory()
    }

    fun getAll(): List<HistoryItem> = history.toList()

    fun search(query: String): List<HistoryItem> {
        val lower = query.lowercase()
        return history.filter {
            it.title.lowercase().contains(lower) || it.url.lowercase().contains(lower)
        }
    }

    fun clearAll() {
        history.clear()
        saveHistory()
    }

    private fun saveHistory() {
        prefManager.saveHistory(gson.toJson(history))
    }
}
