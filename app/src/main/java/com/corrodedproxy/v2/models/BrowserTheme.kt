package com.corrodedproxy.v2.models

import androidx.annotation.ColorInt

data class BrowserTheme(
    val name: String,
    @ColorInt val bgPrimary: Int,
    @ColorInt val bgSecondary: Int,
    @ColorInt val bgSettings: Int,
    @ColorInt val tabActive: Int,
    @ColorInt val accent: Int
) {
    companion object {
        fun earth(ctx: android.content.Context) = BrowserTheme(
            "Earth",
            ctx.getColor(com.corrodedproxy.v2.R.color.earth_bg_primary),
            ctx.getColor(com.corrodedproxy.v2.R.color.earth_bg_secondary),
            ctx.getColor(com.corrodedproxy.v2.R.color.earth_bg_settings),
            ctx.getColor(com.corrodedproxy.v2.R.color.earth_tab_active),
            ctx.getColor(com.corrodedproxy.v2.R.color.earth_accent)
        )
        fun virellus(ctx: android.content.Context) = BrowserTheme(
            "Virellus",
            ctx.getColor(com.corrodedproxy.v2.R.color.virellus_bg_primary),
            ctx.getColor(com.corrodedproxy.v2.R.color.virellus_bg_secondary),
            ctx.getColor(com.corrodedproxy.v2.R.color.virellus_bg_settings),
            ctx.getColor(com.corrodedproxy.v2.R.color.virellus_tab_active),
            ctx.getColor(com.corrodedproxy.v2.R.color.virellus_accent)
        )
        fun neptune(ctx: android.content.Context) = BrowserTheme(
            "Neptune",
            ctx.getColor(com.corrodedproxy.v2.R.color.neptune_bg_primary),
            ctx.getColor(com.corrodedproxy.v2.R.color.neptune_bg_secondary),
            ctx.getColor(com.corrodedproxy.v2.R.color.neptune_bg_settings),
            ctx.getColor(com.corrodedproxy.v2.R.color.neptune_tab_active),
            ctx.getColor(com.corrodedproxy.v2.R.color.neptune_accent)
        )
        fun mars(ctx: android.content.Context) = BrowserTheme(
            "Mars",
            ctx.getColor(com.corrodedproxy.v2.R.color.mars_bg_primary),
            ctx.getColor(com.corrodedproxy.v2.R.color.mars_bg_secondary),
            ctx.getColor(com.corrodedproxy.v2.R.color.mars_bg_settings),
            ctx.getColor(com.corrodedproxy.v2.R.color.mars_tab_active),
            ctx.getColor(com.corrodedproxy.v2.R.color.mars_accent)
        )
        fun solar(ctx: android.content.Context) = BrowserTheme(
            "Solar",
            ctx.getColor(com.corrodedproxy.v2.R.color.solar_bg_primary),
            ctx.getColor(com.corrodedproxy.v2.R.color.solar_bg_secondary),
            ctx.getColor(com.corrodedproxy.v2.R.color.solar_bg_settings),
            ctx.getColor(com.corrodedproxy.v2.R.color.solar_tab_active),
            ctx.getColor(com.corrodedproxy.v2.R.color.solar_accent)
        )
    }
}
