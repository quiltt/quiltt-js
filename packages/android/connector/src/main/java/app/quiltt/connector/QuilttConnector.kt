package app.quiltt.connector

import android.content.Context

class QuilttConnector(context: Context) {
    private var webView: QuilttConnectorWebView = QuilttConnectorWebView(context)
    private var token: String? = null

    fun authenticate(token: String) {
        this.token = token
        // TODO: Implement this
        // webView.authenticate(token)
    }

    fun connect(
        config: QuilttConnectorConnectConfiguration,
        onEvent: ConnectorSDKOnEventCallback? = null,
        onExit: ConnectorSDKOnEventExitCallback? = null,
        onExitSuccess: ConnectorSDKOnExitSuccessCallback? = null,
        onExitAbort: ConnectorSDKOnExitAbortCallback? = null,
        onExitError: ConnectorSDKOnExitErrorCallback? = null
    ): QuilttConnectorWebView {
        webView.load(token, config, onEvent, onExit, onExitSuccess, onExitAbort, onExitError)
        return webView
    }

    fun reconnect(
        config: QuilttConnectorReconnectConfiguration,
        onEvent: ConnectorSDKOnEventCallback? = null,
        onExit: ConnectorSDKOnEventExitCallback? = null,
        onExitSuccess: ConnectorSDKOnExitSuccessCallback? = null,
        onExitAbort: ConnectorSDKOnExitAbortCallback? = null,
        onExitError: ConnectorSDKOnExitErrorCallback? = null
    ): QuilttConnectorWebView {
        webView.load(token, config, onEvent, onExit, onExitSuccess, onExitAbort, onExitError)
        return webView
    }
}