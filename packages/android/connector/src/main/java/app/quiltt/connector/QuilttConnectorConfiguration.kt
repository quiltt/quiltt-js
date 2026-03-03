package app.quiltt.connector

interface QuilttConnectorConfiguration {
    val connectorId: String
    val oauthRedirectUrl: String
    val connectionId: String?
    val institution: String?
}

data class QuilttConnectorConnectConfiguration(
    override val connectorId: String,
    override val oauthRedirectUrl: String,
    override val institution: String? = null,
) : QuilttConnectorConfiguration {
    override val connectionId: String? = null // always null for connect, cannot be set
}

data class QuilttConnectorReconnectConfiguration(
    override val connectorId: String,
    override val oauthRedirectUrl: String,
    override val connectionId: String,
) : QuilttConnectorConfiguration {
    override val institution: String? = null // always null for reconnect, cannot be set
}