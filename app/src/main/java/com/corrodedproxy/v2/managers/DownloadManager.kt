package com.corrodedproxy.v2.managers

import android.app.DownloadManager as AndroidDownloadManager
import android.content.Context
import android.net.Uri
import android.os.Environment
import android.webkit.MimeTypeMap
import android.webkit.URLUtil
import com.corrodedproxy.v2.models.DownloadItem
import com.corrodedproxy.v2.models.DownloadState

class DownloadManager(private val context: Context) {

    private val downloads = mutableListOf<DownloadItem>()
    private val listeners = mutableListOf<DownloadListener>()

    interface DownloadListener {
        fun onDownloadStarted(item: DownloadItem)
        fun onDownloadProgress(item: DownloadItem)
        fun onDownloadCompleted(item: DownloadItem)
        fun onDownloadFailed(item: DownloadItem)
    }

    fun addListener(listener: DownloadListener) = listeners.add(listener)
    fun removeListener(listener: DownloadListener) = listeners.remove(listener)

    fun startDownload(url: String, userAgent: String, contentDisposition: String, mimeType: String) {
        val filename = URLUtil.guessFileName(url, contentDisposition, mimeType)
        val item = DownloadItem(
            filename = filename,
            url = url
        )
        downloads.add(0, item)
        listeners.forEach { it.onDownloadStarted(item) }

        try {
            val dm = context.getSystemService(Context.DOWNLOAD_SERVICE) as AndroidDownloadManager
            val request = AndroidDownloadManager.Request(Uri.parse(url)).apply {
                setTitle(filename)
                setDescription("Downloading via CorrodedProxyV2")
                setNotificationVisibility(AndroidDownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename)
                addRequestHeader("User-Agent", userAgent)
                val mime = mimeType.ifEmpty {
                    MimeTypeMap.getSingleton()
                        .getMimeTypeFromExtension(MimeTypeMap.getFileExtensionFromUrl(url))
                        ?: "application/octet-stream"
                }
                setMimeType(mime)
            }
            dm.enqueue(request)
            item.state = DownloadState.COMPLETED
            listeners.forEach { it.onDownloadCompleted(item) }
        } catch (e: Exception) {
            item.state = DownloadState.FAILED
            listeners.forEach { it.onDownloadFailed(item) }
        }
    }

    fun getDownloads(): List<DownloadItem> = downloads.toList()

    fun cancelDownload(id: Long) {
        val item = downloads.find { it.id == id }
        if (item != null) {
            item.state = DownloadState.CANCELLED
            listeners.forEach { it.onDownloadProgress(item) }
        }
    }

    fun clearCompleted() {
        downloads.removeAll { it.state == DownloadState.COMPLETED || it.state == DownloadState.CANCELLED }
    }
}
