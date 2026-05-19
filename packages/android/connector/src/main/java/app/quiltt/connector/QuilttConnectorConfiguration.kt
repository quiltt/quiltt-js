package app.quiltt.connector

interface QuilttConnectorConfiguration {
    val connectorId: String
    val appLauncherUrl: String
    val connectionId: String?
    val institution: String?
    val themeMode: String?
        get() = null
}

data class QuilttConnectorConnectConfiguration(
    override val connectorId: String,
    override val appLauncherUrl: String,
    override val institution: String? = null,
    override val themeMode: String? = null,
) : QuilttConnectorConfiguration {
    override val connectionId: String? = null // always null for connect, cannot be set
}

data class QuilttConnectorReconnectConfiguration(
    override val connectorId: String,
    override val appLauncherUrl: String,
    override val connectionId: String,
    override val themeMode: String? = null,
) : QuilttConnectorConfiguration {
    override val institution: String? = null // always null for reconnect, cannot be set
}