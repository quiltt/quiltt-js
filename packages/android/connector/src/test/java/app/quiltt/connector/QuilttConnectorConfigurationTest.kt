package app.quiltt.connector

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class QuilttConnectorConfigurationTest {
    // ConnectConfiguration

    @Test
    fun connectConfiguration_requiredFields() {
        val config = QuilttConnectorConnectConfiguration(
            connectorId = "my-connector",
            appLauncherUrl = "https://example.com/callback",
        )
        assertEquals("my-connector", config.connectorId)
        assertEquals("https://example.com/callback", config.appLauncherUrl)
        assertNull(config.connectionId)
        assertNull(config.institution)
    }

    @Test
    fun connectConfiguration_withInstitution() {
        val config = QuilttConnectorConnectConfiguration(
            connectorId = "my-connector",
            appLauncherUrl = "https://example.com/callback",
            institution = "mx_bank_1",
        )
        assertEquals("mx_bank_1", config.institution)
        assertNull(config.connectionId)
    }

    // ReconnectConfiguration

    @Test
    fun reconnectConfiguration_requiredFields() {
        val config = QuilttConnectorReconnectConfiguration(
            connectorId = "my-connector",
            appLauncherUrl = "https://example.com/callback",
            connectionId = "conn-abc123",
        )
        assertEquals("my-connector", config.connectorId)
        assertEquals("https://example.com/callback", config.appLauncherUrl)
        assertEquals("conn-abc123", config.connectionId)
        assertNull(config.institution)
    }

    @Test
    fun reconnectConfiguration_institutionIsAlwaysNull() {
        val config = QuilttConnectorReconnectConfiguration(
            connectorId = "c",
            appLauncherUrl = "https://example.com",
            connectionId = "conn-1",
        )
        assertNull(config.institution)
    }
}
