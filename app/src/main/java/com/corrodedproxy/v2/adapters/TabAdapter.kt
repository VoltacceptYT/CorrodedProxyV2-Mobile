package com.corrodedproxy.v2.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.corrodedproxy.v2.R
import com.corrodedproxy.v2.models.BrowserTab

class TabAdapter(
    private val tabs: MutableList<BrowserTab>,
    private val onTabClick: (Int) -> Unit,
    private val onTabClose: (Int) -> Unit
) : RecyclerView.Adapter<TabAdapter.TabViewHolder>() {

    private var activeIndex = 0

    inner class TabViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val favicon: ImageView = itemView.findViewById(R.id.tab_favicon)
        val title: TextView = itemView.findViewById(R.id.tab_title)
        val closeBtn: ImageButton = itemView.findViewById(R.id.btn_close_tab)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TabViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_tab, parent, false)
        return TabViewHolder(view)
    }

    override fun onBindViewHolder(holder: TabViewHolder, position: Int) {
        val tab = tabs[position]
        holder.title.text = tab.title.ifEmpty { "New Tab" }

        if (tab.favicon != null) {
            holder.favicon.setImageBitmap(tab.favicon)
            holder.favicon.clearColorFilter()
        } else {
            holder.favicon.setImageResource(R.drawable.ic_globe)
            holder.favicon.setColorFilter(
                holder.itemView.context.getColor(R.color.text_secondary),
                android.graphics.PorterDuff.Mode.SRC_IN
            )
        }

        holder.itemView.isSelected = position == activeIndex
        holder.itemView.setOnClickListener { onTabClick(position) }
        holder.closeBtn.setOnClickListener { onTabClose(position) }
    }

    override fun getItemCount(): Int = tabs.size

    fun updateTabs(newTabs: List<BrowserTab>, newActiveIndex: Int) {
        tabs.clear()
        tabs.addAll(newTabs)
        activeIndex = newActiveIndex
        notifyDataSetChanged()
    }

    fun setActiveIndex(index: Int) {
        val old = activeIndex
        activeIndex = index
        notifyItemChanged(old)
        notifyItemChanged(index)
    }
}
