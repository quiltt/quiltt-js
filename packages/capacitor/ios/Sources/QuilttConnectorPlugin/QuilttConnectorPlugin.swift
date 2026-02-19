import Foundation
import Capacitor

/// QuilttConnector Capacitor Plugin for iOS
/// Handles deep linking, URL opening, and OAuth redirect flows for Quiltt Connector integration
@objc(QuilttConnectorPlugin)
public class QuilttConnectorPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "QuilttConnectorPlugin"
    public let jsName = "QuilttConnector"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "openUrl", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getLaunchUrl", returnType: CAPPluginReturnPromise)
    ]

    private var launchUrl: URL?

    public override func load() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleOpenUrl(_:)),
            name: Notification.Name.capacitorOpenURL,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleOpenUrl(_:)),
            name: Notification.Name.capacitorOpenUniversalLink,
            object: nil
        )
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    /// Handle incoming URLs from deep links or universal links
    @objc private func handleOpenUrl(_ notification: Notification) {
        guard let object = notification.object as? [String: Any],
              let url = object["url"] as? URL else {
            return
        }

        // Store as launch URL
        launchUrl = url

        // Notify JavaScript listeners
        notifyListeners("deepLink", data: [
            "url": url.absoluteString
        ])
    }

    /// Opens a URL in the system browser
    /// Used for OAuth flows and external authentication
    @objc func openUrl(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"),
              let url = URL(string: urlString) else {
            call.reject("Invalid URL")
            return
        }

        DispatchQueue.main.async {
            if #available(iOS 10.0, *) {
                UIApplication.shared.open(url, options: [:]) { success in
                    if success {
                        call.resolve([
                            "completed": true
                        ])
                    } else {
                        call.reject("Failed to open URL")
                    }
                }
            } else {
                let success = UIApplication.shared.openURL(url)
                if success {
                    call.resolve([
                        "completed": true
                    ])
                } else {
                    call.reject("Failed to open URL")
                }
            }
        }
    }

    /// Returns the URL that launched the app (if any)
    /// Used to handle OAuth callbacks and deep link navigation
    @objc func getLaunchUrl(_ call: CAPPluginCall) {
        if let url = launchUrl {
            call.resolve([
                "url": url.absoluteString
            ])
        } else {
            call.resolve([
                "url": NSNull()
            ])
        }
    }
}
