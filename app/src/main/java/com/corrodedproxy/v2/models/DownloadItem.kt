package com.corrodedproxy.v2.models

data class DownloadItem(
    val id: Long = System.currentTimeMillis(),
    val filename: String,
    val url: String,
    var progress: Int = 0,
    var state: DownloadState = DownloadState.IN_PROGRESS,
    var bytesDownloaded: Long = 0,
    var totalBytes: Long = -1,
    var speed: Long = 0
)

enum class DownloadState {
    IN_PROGRESS, COMPLETED, FAILED, CANCELLED, PAUSED
}
