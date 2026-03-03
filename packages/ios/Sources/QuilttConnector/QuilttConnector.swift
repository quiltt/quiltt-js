// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import Foundation
import WebKit

public class QuilttConnector {
    private var webview: QuilttConnectorWebview?
    private var token: String?
    private var connectorId: String?
    private var connectionId: String?

    public init() {
        webview = QuilttConnectorWebview.init()
    }

    public func authenticate(token: String) {
        self.token = token
    }

    public func connect(
        config: QuilttConnectorConnectConfiguration,
        onEvent: ConnectorSDKOnEventCallback? = nil,
        onExit: ConnectorSDKOnEventExitCallback? = nil,
        onExitSuccess: ConnectorSDKOnExitSuccessCallback? = nil,
        onExitAbort: ConnectorSDKOnExitAbortCallback? = nil,
        onExitError: ConnectorSDKOnExitErrorCallback? = nil
    ) -> WKWebView {
        webview!.load(
            token: self.token,
            config: config,
            onEvent: onEvent,
            onExit: onExit,
            onExitSuccess: onExitSuccess,
            onExitAbort: onExitAbort,
            onExitError: onExitError)
        return webview!
    }

    public func reconnect(
        config: QuilttConnectorReconnectConfiguration,
        onEvent: ConnectorSDKOnEventCallback? = nil,
        onExit: ConnectorSDKOnEventExitCallback? = nil,
        onExitSuccess: ConnectorSDKOnExitSuccessCallback? = nil,
        onExitAbort: ConnectorSDKOnExitAbortCallback? = nil,
        onExitError: ConnectorSDKOnExitErrorCallback? = nil
    ) -> WKWebView {
        webview!.load(
            token: self.token,
            config: config,
            onEvent: onEvent,
            onExit: onExit,
            onExitSuccess: onExitSuccess,
            onExitAbort: onExitAbort,
            onExitError: onExitError)
        return webview!
    }
}
