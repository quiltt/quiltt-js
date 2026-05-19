// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import Foundation

public protocol QuilttConnectorConfiguration {
    var connectorId: String { get }
    var appLauncherUrl: String { get }
    var connectionId: String? { get }
    var institution: String? { get }
    var themeMode: String? { get }
}

extension QuilttConnectorConfiguration {
    public var themeMode: String? { nil }
}

public struct QuilttConnectorConnectConfiguration: QuilttConnectorConfiguration {
    public var connectorId: String
    public var appLauncherUrl: String
    public var connectionId: String?
    public var institution: String?
    public var themeMode: String?
    public init(
        connectorId: String,
        appLauncherUrl: String,
        institution: String? = nil,
        themeMode: String? = nil
    ) {
        self.connectorId = connectorId
        self.appLauncherUrl = appLauncherUrl
        self.institution = institution
        self.themeMode = themeMode
    }
}

public struct QuilttConnectorReconnectConfiguration: QuilttConnectorConfiguration {
    public var connectorId: String
    public var appLauncherUrl: String
    public var connectionId: String?
    public var institution: String?
    public var themeMode: String?

    public init(
        connectorId: String,
        appLauncherUrl: String,
        connectionId: String,
        themeMode: String? = nil
    ) {
        self.connectorId = connectorId
        self.appLauncherUrl = appLauncherUrl
        self.connectionId = connectionId
        self.themeMode = themeMode
    }
}
