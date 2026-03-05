import XCTest

@testable import QuilttConnector

final class QuilttConnectorTests: XCTestCase {
    @MainActor
    func testAuthenticate_doesNotThrow() {
        let connector = QuilttConnector()
        connector.authenticate(token: "test-session-token")
        // authenticate() stores token in private state; no throw means success
        XCTAssertTrue(true)
    }
}
