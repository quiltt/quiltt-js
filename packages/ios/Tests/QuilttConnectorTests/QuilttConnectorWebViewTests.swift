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
}
