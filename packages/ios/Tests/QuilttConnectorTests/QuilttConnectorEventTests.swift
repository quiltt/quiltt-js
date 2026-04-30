import XCTest

@testable import QuilttConnector

final class ConnectorSDKEventTypeTests: XCTestCase {
    func testEventType_load_rawValue() {
        XCTAssertEqual(ConnectorSDKEventType.Load.rawValue, "loaded")
    }

    func testEventType_exitSuccess_rawValue() {
        XCTAssertEqual(ConnectorSDKEventType.ExitSuccess.rawValue, "exited.successful")
    }

    func testEventType_exitAbort_rawValue() {
        XCTAssertEqual(ConnectorSDKEventType.ExitAbort.rawValue, "exited.aborted")
    }

    func testEventType_exitError_rawValue() {
        XCTAssertEqual(ConnectorSDKEventType.ExitError.rawValue, "exited.errored")
    }

    func testEventType_allCases_haveDistinctRawValues() {
        let values = [
            ConnectorSDKEventType.Load.rawValue,
            ConnectorSDKEventType.ExitSuccess.rawValue,
            ConnectorSDKEventType.ExitAbort.rawValue,
            ConnectorSDKEventType.ExitError.rawValue,
        ]
        XCTAssertEqual(values.count, Set(values).count)
    }
}

final class ConnectorSDKCallbackMetadataTests: XCTestCase {
    func testCallbackMetadata_allFields() {
        let metadata = ConnectorSDKCallbackMetadata(
            connectorId: "connector-1",
            profileId: "profile-1",
            connectionId: "conn-1"
        )
        XCTAssertEqual(metadata.connectorId, "connector-1")
        XCTAssertEqual(metadata.profileId, "profile-1")
        XCTAssertEqual(metadata.connectionId, "conn-1")
    }

    func testCallbackMetadata_nilOptionals() {
        let metadata = ConnectorSDKCallbackMetadata(
            connectorId: "connector-1",
            profileId: nil,
            connectionId: nil
        )
        XCTAssertEqual(metadata.connectorId, "connector-1")
        XCTAssertNil(metadata.profileId)
        XCTAssertNil(metadata.connectionId)
    }
}
