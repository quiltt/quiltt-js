import XCTest

@testable import QuilttConnector

final class QuilttConnectorWebViewTests: XCTestCase {

    @MainActor
    func testLoad_withThemeMode_doesNotCrash() {
        let config = QuilttConnectorConnectConfiguration(
            connectorId: "test-connector",
            appLauncherUrl: "https://example.com/callback",
            themeMode: "dark"
        )

        let webView = QuilttConnectorWebview()
        let navigation = webView.load(config: config)

        // load() should return a WKNavigation object (non-nil) on success
        XCTAssertNotNil(navigation, "load() should return a non-nil WKNavigation")
    }

    @MainActor
    func testLoad_withoutThemeMode_doesNotCrash() {
        let config = QuilttConnectorConnectConfiguration(
            connectorId: "test-connector",
            appLauncherUrl: "https://example.com/callback"
        )

        let webView = QuilttConnectorWebview()
        let navigation = webView.load(config: config)

        XCTAssertNotNil(navigation, "load() should return a non-nil WKNavigation")
    }

    @MainActor
    func testInit_configuresWebViewCorrectly() {
        let webView = QuilttConnectorWebview()

        // Verify basic configuration
        if #available(iOS 14.0, macOS 11.0, *) {
            XCTAssertTrue(webView.configuration.defaultWebpagePreferences.allowsContentJavaScript)
        } else {
            XCTAssertTrue(webView.configuration.preferences.javaScriptEnabled)
        }
        XCTAssertNotNil(webView.navigationDelegate)

        #if os(iOS)
        XCTAssertFalse(webView.isMultipleTouchEnabled)
        #endif
    }

    // MARK: - OAuth URL Handling

    @MainActor
    func testHandleOAuthUrl_skipsNonHTTPS() {
        let config = QuilttConnectorConnectConfiguration(
            connectorId: "test-connector",
            appLauncherUrl: "https://example.com/callback"
        )
        let webView = QuilttConnectorWebview()
        webView.load(config: config)

        // Non-HTTPS URL should be skipped without firing callbacks
        let nonHttpsUrl = URL(string: "http://example.com/oauth")!
        webView.handleOAuthUrl(nonHttpsUrl)

        // Should not crash — non-HTTPS URLs are silently skipped
    }

    @MainActor
    func testHandleOAuthUrl_acceptsHTTPS() {
        let config = QuilttConnectorConnectConfiguration(
            connectorId: "test-connector",
            appLauncherUrl: "https://example.com/callback"
        )
        let webView = QuilttConnectorWebview()
        webView.load(config: config)

        // HTTPS URL should be accepted
        let httpsUrl = URL(string: "https://secure.plaid.com/hl/test")!
        webView.handleOAuthUrl(httpsUrl)

        // Should not crash — HTTPS URLs pass the scheme check
    }

    @MainActor
    func testFireOAuthFailure_invokesCallbacks() {
        let config = QuilttConnectorConnectConfiguration(
            connectorId: "test-connector",
            appLauncherUrl: "https://example.com/callback"
        )

        var onEventCalled = false
        var onExitCalled = false
        var onExitErrorCalled = false

        let webView = QuilttConnectorWebview()
        webView.load(
            config: config,
            onEvent: { _, _ in onEventCalled = true },
            onExit: { _, _ in onExitCalled = true },
            onExitError: { _ in onExitErrorCalled = true }
        )

        webView.fireOAuthFailure()

        XCTAssertTrue(onEventCalled, "onEvent should be called on OAuth failure")
        XCTAssertTrue(onExitCalled, "onExit should be called on OAuth failure")
        XCTAssertTrue(onExitErrorCalled, "onExitError should be called on OAuth failure")
    }

    @MainActor
    func testFireOAuthFailure_noConnectorId_doesNotFire() {
        let webView = QuilttConnectorWebview()

        var onEventCalled = false
        var onExitCalled = false
        var onExitErrorCalled = false

        webView.onEvent = { _, _ in onEventCalled = true }
        webView.onExit = { _, _ in onExitCalled = true }
        webView.onExitError = { _ in onExitErrorCalled = true }

        // config is nil, so connectorId is unavailable
        webView.fireOAuthFailure()

        XCTAssertFalse(onEventCalled, "onEvent should NOT be called without connectorId")
        XCTAssertFalse(onExitCalled, "onExit should NOT be called without connectorId")
        XCTAssertFalse(onExitErrorCalled, "onExitError should NOT be called without connectorId")
    }
}
