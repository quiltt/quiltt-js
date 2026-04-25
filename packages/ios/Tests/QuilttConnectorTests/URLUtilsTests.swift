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

    // resolveUrl

    func testResolveUrl_withPlainHttpsUrl_returnsAsIs() {
        let url = "https://api.example.com/oauth?client_id=123"
        XCTAssertEqual(URLUtils.resolveUrl(url), url)
    }

    func testResolveUrl_withSingleEncodedHttpsUrl_decodesOnce() {
        let encoded = "https%3A%2F%2Fapi.example.com%2Foauth"
        XCTAssertEqual(URLUtils.resolveUrl(encoded), "https://api.example.com/oauth")
    }

    func testResolveUrl_withDoubleEncodedHttpsUrl_decodesToHttps() {
        let doubleEncoded = "https%253A%252F%252Fapi.example.com%252Foauth"
        XCTAssertEqual(URLUtils.resolveUrl(doubleEncoded), "https://api.example.com/oauth")
    }

    func testResolveUrl_withNonHttpsUrl_returnsNil() {
        XCTAssertNil(URLUtils.resolveUrl("http://example.com"))
    }

    func testResolveUrl_withGarbageString_returnsNil() {
        XCTAssertNil(URLUtils.resolveUrl("not-a-url"))
    }
}
