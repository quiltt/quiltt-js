package app.quiltt.connector

data class ConnectorSDKCallbackMetadata(
    val connectorId: String,
    val profileId: String?,
    val connectionId: String?
)

typealias ConnectorSDKOnEventCallback = (ConnectorSDKEventType, ConnectorSDKCallbackMetadata) -> Unit
typealias ConnectorSDKOnEventExitCallback = (ConnectorSDKEventType, ConnectorSDKCallbackMetadata) -> Unit

typealias ConnectorSDKOnExitSuccessCallback = (ConnectorSDKCallbackMetadata) -> Unit
typealias ConnectorSDKOnExitAbortCallback = (ConnectorSDKCallbackMetadata) -> Unit
typealias ConnectorSDKOnExitErrorCallback = (ConnectorSDKCallbackMetadata) -> Unit

enum class ConnectorSDKEventType(val value: String) {
    Load("loaded"),
    ExitSuccess("exited.successful"),
    ExitAbort("exited.aborted"),
    ExitError("exited.errored")
}