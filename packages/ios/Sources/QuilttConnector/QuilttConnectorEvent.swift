import Foundation

public struct ConnectorSDKCallbackMetadata {
    public let connectorId: String
    public let profileId: String?
    public let connectionId: String?
}

public typealias ConnectorSDKOnEventCallback = (ConnectorSDKEventType, ConnectorSDKCallbackMetadata)
    -> Void
public typealias ConnectorSDKOnEventExitCallback = (
    ConnectorSDKEventType, ConnectorSDKCallbackMetadata
) -> Void

public typealias ConnectorSDKOnExitSuccessCallback = (ConnectorSDKCallbackMetadata) -> Void
public typealias ConnectorSDKOnExitAbortCallback = (ConnectorSDKCallbackMetadata) -> Void
public typealias ConnectorSDKOnExitErrorCallback = (ConnectorSDKCallbackMetadata) -> Void

public enum ConnectorSDKEventType: String {
    case Load = "loaded"
    case ExitSuccess = "exited.successful"
    case ExitAbort = "exited.aborted"
    case ExitError = "exited.errored"
}
