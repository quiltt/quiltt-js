package app.quiltt.connector

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class QuilttConnectorEventTest {
    // ConnectorSDKEventType

    @Test
    fun eventType_load_rawValue() {
        assertEquals("loaded", ConnectorSDKEventType.Load.value)
    }

    @Test
    fun eventType_exitSuccess_rawValue() {
        assertEquals("exited.successful", ConnectorSDKEventType.ExitSuccess.value)
    }

    @Test
    fun eventType_exitAbort_rawValue() {
        assertEquals("exited.aborted", ConnectorSDKEventType.ExitAbort.value)
    }

    @Test
    fun eventType_exitError_rawValue() {
        assertEquals("exited.errored", ConnectorSDKEventType.ExitError.value)
    }

    @Test
    fun eventType_allCases_haveDistinctRawValues() {
        val values = ConnectorSDKEventType.entries.map { it.value }
        assertEquals(values.size, values.toSet().size)
    }

    // ConnectorSDKCallbackMetadata

    @Test
    fun callbackMetadata_allFields() {
        val metadata = ConnectorSDKCallbackMetadata(
            connectorId = "connector-1",
            profileId = "profile-1",
            connectionId = "conn-1",
        )
        assertEquals("connector-1", metadata.connectorId)
        assertEquals("profile-1", metadata.profileId)
        assertEquals("conn-1", metadata.connectionId)
    }

    @Test
    fun callbackMetadata_nullOptionals() {
        val metadata = ConnectorSDKCallbackMetadata(
            connectorId = "connector-1",
            profileId = null,
            connectionId = null,
        )
        assertEquals("connector-1", metadata.connectorId)
        assertNull(metadata.profileId)
        assertNull(metadata.connectionId)
    }
}
