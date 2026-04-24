import XCTest

@testable import QuilttConnector

final class URLUtilsTests: XCTestCase {
    func testIsEncoded_withPercent20() {
        XCTAssertTrue(URLUtils.isEncoded("hello%20world"))
    }

    func testIsEncoded_withPercent3A() {
        XCTAssertTrue(URLUtils.isEncoded("https%3A%2F%2Fexample.com"))
    }

    func testIsEncoded_withLowercaseHex() {
        XCTAssertTrue(URLUtils.isEncoded("hello%2fworld"))
    }

    func testIsEncoded_withPlainStringWithSpaces() {
        XCTAssertFalse(URLUtils.isEncoded("hello world"))
    }

    func testIsEncoded_withPlainUrl() {
        XCTAssertFalse(URLUtils.isEncoded("https://example.com"))
    }

    func testIsEncoded_withEmptyString() {
        XCTAssertFalse(URLUtils.isEncoded(""))
    }

    func testIsEncoded_withDoubleEncoded_returnsFalse() {
        // Double-encoded strings are not considered properly encoded
        XCTAssertFalse(URLUtils.isEncoded("https%253A%252F%252Fexample.com"))
    }

    func testIsDoubleEncoded_withDoubleEncoded() {
        XCTAssertTrue(URLUtils.isDoubleEncoded("https%253A%252F%252Fexample.com"))
    }

    func testIsDoubleEncoded_withSingleEncoded() {
        XCTAssertFalse(URLUtils.isDoubleEncoded("https%3A%2F%2Fexample.com"))
    }

    func testIsDoubleEncoded_withPlainUrl() {
        XCTAssertFalse(URLUtils.isDoubleEncoded("https://example.com"))
    }

    func testIsDoubleEncoded_withEmptyString() {
        XCTAssertFalse(URLUtils.isDoubleEncoded(""))
    }

    func testSmartEncodeURIComponent_emptyString() {
        XCTAssertEqual(URLUtils.smartEncodeURIComponent(""), "")
    }

    func testSmartEncodeURIComponent_alreadyEncoded_returnsAsIs() {
        let encoded = "https%3A%2F%2Fexample.com%2Fcallback"
        XCTAssertEqual(URLUtils.smartEncodeURIComponent(encoded), encoded)
    }

    func testSmartEncodeURIComponent_plainUrl_getsEncoded() {
        let plain = "https://example.com/callback?foo=bar baz"
        let result = URLUtils.smartEncodeURIComponent(plain)
        XCTAssertNotEqual(result, plain)
        XCTAssertFalse(result.contains(" "))
    }

    func testNormalizeUrlEncoding_withDoubleEncoded_decodesOnce() {
        let doubleEncoded = "https%253A%252F%252Fexample.com"
        let result = URLUtils.normalizeUrlEncoding(doubleEncoded)
        XCTAssertEqual(result, "https%3A%2F%2Fexample.com")
    }

    func testNormalizeUrlEncoding_withPlainUrl_returnsUnchanged() {
        let plain = "https://example.com"
        XCTAssertEqual(URLUtils.normalizeUrlEncoding(plain), plain)
    }

    func testNormalizeUrlEncoding_withSingleEncoded_returnsUnchanged() {
        let singleEncoded = "https%3A%2F%2Fexample.com"
        XCTAssertEqual(URLUtils.normalizeUrlEncoding(singleEncoded), singleEncoded)
    }

    // Double-encoding scenario tests

    func testNormalizeUrlEncoding_withDoubleEncodedOAuthUrl() {
        // Reproduces the bug: OAuth URL arrives double-encoded
        let doubleEncodedUrl = "https%253A%252F%252Fapi.oauth.example.com%252Faggregator-oauth"
        let result = URLUtils.normalizeUrlEncoding(doubleEncodedUrl)

        // After one decode, it should become single-encoded
        XCTAssertEqual(result, "https%3A%2F%2Fapi.oauth.example.com%2Faggregator-oauth")
    }

    func testNormalizeUrlEncoding_withSingleEncodedOAuthUrl() {
        // Single-encoded OAuth URL should not be decoded further
        let singleEncoded = "https%3A%2F%2Fapi.example.com%2Foauth%3Fclient_id%3D123"
        let result = URLUtils.normalizeUrlEncoding(singleEncoded)
        XCTAssertEqual(result, singleEncoded)
    }

    func testNormalizeUrlEncoding_withPlainHttpsUrl() {
        // Plain non-encoded HTTPS URL should pass through unchanged
        let plainUrl = "https://api.example.com/oauth?client_id=123"
        let result = URLUtils.normalizeUrlEncoding(plainUrl)
        XCTAssertEqual(result, plainUrl)
    }
}
