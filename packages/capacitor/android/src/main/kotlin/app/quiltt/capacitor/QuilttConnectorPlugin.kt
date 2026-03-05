package app.quiltt.capacitor

import android.content.Intent
import android.net.Uri
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * QuilttConnector Capacitor Plugin for Android
 * Handles deep linking, URL opening, and OAuth redirect flows for Quiltt Connector integration
 */
@CapacitorPlugin(name = "QuilttConnector")
class QuilttConnectorPlugin : Plugin() {
    private var appLauncherUrl: String? = null

    override fun load() {
        // Capture the app launcher URL when the app starts from a deep-link intent
        val intent = activity?.intent
        handleIntent(intent)
    }

    override fun handleOnNewIntent(intent: Intent) {
        super.handleOnNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        val data = intent?.data
        if (data != null) {
            val url = data.toString()
            appLauncherUrl = url

            // Notify JavaScript listeners
            val ret = JSObject()
            ret.put("url", url)
            notifyListeners("deepLink", ret)
        }
    }

    /**
     * Opens a URL in the system browser
     * Used for OAuth flows and external authentication
     */
    @PluginMethod
    fun openUrl(call: PluginCall) {
        val urlString = call.getString("url")
        if (urlString.isNullOrEmpty()) {
            call.reject("Invalid URL")
            return
        }

        try {
            val uri = Uri.parse(urlString)
            val intent = Intent(Intent.ACTION_VIEW, uri)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)

            val ret = JSObject()
            ret.put("completed", true)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to open URL: ${e.message}")
        }
    }

    /**
     * Returns the app launcher URL (if any)
     * Used to handle OAuth callbacks and deep link navigation
     */
    @PluginMethod
    fun getAppLauncherUrl(call: PluginCall) {
        val ret = JSObject()
        if (appLauncherUrl != null) {
            ret.put("url", appLauncherUrl)
        } else {
            ret.put("url", JSObject.NULL)
        }
        call.resolve(ret)
    }
}
