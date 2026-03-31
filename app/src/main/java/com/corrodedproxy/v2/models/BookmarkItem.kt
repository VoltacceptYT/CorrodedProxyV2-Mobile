package com.corrodedproxy.v2.models

data class BookmarkItem(
    val id: Long = System.currentTimeMillis(),
    val title: String,
    val url: String,
    val timestamp: Long = System.currentTimeMillis()
)
