package com.corrodedproxy.v2.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.corrodedproxy.v2.R
import com.corrodedproxy.v2.models.DownloadItem
import com.corrodedproxy.v2.models.DownloadState

class DownloadAdapter(
    private val downloads: MutableList<DownloadItem>,
    private val onCancel: (Long) -> Unit
) : RecyclerView.Adapter<DownloadAdapter.DownloadViewHolder>() {

    inner class DownloadViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val filename: TextView = view.findViewById(R.id.download_filename)
        val status: TextView = view.findViewById(R.id.download_status)
        val speed: TextView = view.findViewById(R.id.download_speed)
        val progress: ProgressBar = view.findViewById(R.id.download_progress)
        val cancelBtn: ImageButton = view.findViewById(R.id.btn_cancel_download)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DownloadViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_download, parent, false)
        return DownloadViewHolder(view)
    }

    override fun onBindViewHolder(holder: DownloadViewHolder, position: Int) {
        val item = downloads[position]
        holder.filename.text = item.filename
        holder.progress.progress = item.progress

        when (item.state) {
            DownloadState.IN_PROGRESS -> {
                val pct = if (item.totalBytes > 0) "${item.progress}%" else "Downloading..."
                holder.status.text = pct
                if (item.speed > 0) {
                    holder.speed.text = formatSpeed(item.speed)
                } else {
                    holder.speed.text = ""
                }
            }
            DownloadState.COMPLETED -> {
                holder.status.text = "Done"
                holder.speed.text = ""
                holder.progress.progress = 100
            }
            DownloadState.FAILED -> {
                holder.status.text = "Failed"
                holder.speed.text = ""
            }
            DownloadState.CANCELLED -> {
                holder.status.text = "Cancelled"
                holder.speed.text = ""
            }
            DownloadState.PAUSED -> {
                holder.status.text = "Paused"
                holder.speed.text = ""
            }
        }

        holder.cancelBtn.setOnClickListener { onCancel(item.id) }
    }

    override fun getItemCount(): Int = downloads.size

    fun updateDownloads(newItems: List<DownloadItem>) {
        downloads.clear()
        downloads.addAll(newItems)
        notifyDataSetChanged()
    }

    private fun formatSpeed(bytesPerSec: Long): String {
        return when {
            bytesPerSec > 1_000_000 -> String.format("%.1f MB/s", bytesPerSec / 1_000_000.0)
            bytesPerSec > 1_000 -> String.format("%.0f KB/s", bytesPerSec / 1_000.0)
            else -> "$bytesPerSec B/s"
        }
    }
}
