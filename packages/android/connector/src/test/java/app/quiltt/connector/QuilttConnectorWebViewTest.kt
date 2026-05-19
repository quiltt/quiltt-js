package app.quiltt.connector

import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [33])
class QuilttConnectorWebViewTest {

    @Test
    fun load_includesThemeModeWhenProvided() {
        val context = RuntimeEnvironment.getApplication()
        val webView = QuilttConnectorWebView(context)

        val config = QuilttConnectorConnectConfiguration(
            connectorId = "test-connector",
            appLauncherUrl = "https://example.com/callback",
            themeMode = "dark",
        )

        webView.load(
            token = "test-token",
            config = config,
        )

        val loadedUrl = shadowOf(webView).lastLoadedUrl
        assertTrue(loadedUrl.contains("theme_mode=dark"))
    }

    @Test
    fun load_doesNotIncludeThemeModeWhenNotProvided() {
        val context = RuntimeEnvironment.getApplication()
        val webView = QuilttConnectorWebView(context)

        val config = QuilttConnectorConnectConfiguration(
            connectorId = "test-connector",
            appLauncherUrl = "https://example.com/callback",
        )

        webView.load(
            token = "test-token",
            config = config,
        )

        val loadedUrl = shadowOf(webView).lastLoadedUrl
        assertTrue(loadedUrl.contains("test-connector.quiltt.app"))
        assertTrue(!loadedUrl.contains("theme_mode"))
    }

    @Test
    fun load_includesAgentAndModeHeaders() {
        val context = RuntimeEnvironment.getApplication()
        val webView = QuilttConnectorWebView(context)

        val config = QuilttConnectorConnectConfiguration(
            connectorId = "test-connector",
            appLauncherUrl = "https://example.com/callback",
        )

        webView.load(
            token = "test-token",
            config = config,
        )

        val loadedUrl = shadowOf(webView).lastLoadedUrl
        assertTrue(loadedUrl.startsWith("https://test-connector.quiltt.app"))
        assertTrue(loadedUrl.contains("mode=webview"))
        assertTrue(loadedUrl.contains("agent=android-"))
    }
}
