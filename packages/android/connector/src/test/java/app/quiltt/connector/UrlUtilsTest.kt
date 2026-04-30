package app.quiltt.connector

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [33])
class UrlUtilsTest {
    // isEncoded

    @Test
    fun isEncoded_withPercent20() {
        assertTrue(UrlUtils.isEncoded("hello%20world"))
    }

    @Test
    fun isEncoded_withPercent3A() {
        assertTrue(UrlUtils.isEncoded("https%3A%2F%2Fexample.com"))
    }

    @Test
    fun isEncoded_withLowercaseHex() {
        assertTrue(UrlUtils.isEncoded("hello%2fworld"))
    }

    @Test
    fun isEncoded_withPlainStringWithSpaces() {
        assertFalse(UrlUtils.isEncoded("hello world"))
    }

    @Test
    fun isEncoded_withPlainUrl() {
        assertFalse(UrlUtils.isEncoded("https://example.com"))
    }

    @Test
    fun isEncoded_withEmptyString() {
        assertFalse(UrlUtils.isEncoded(""))
    }

    @Test
    fun isEncoded_withDoubleEncoded_returnsFalse() {
        // Double-encoded strings are not considered properly encoded
        assertFalse(UrlUtils.isEncoded("https%253A%252F%252Fexample.com"))
    }

    // smartEncodeURIComponent

    @Test
    fun smartEncodeURIComponent_emptyString() {
        assertEquals("", UrlUtils.smartEncodeURIComponent(""))
    }

    @Test
    fun smartEncodeURIComponent_alreadyEncoded_returnsAsIs() {
        val encoded = "https%3A%2F%2Fexample.com%2Fcallback"
        assertEquals(encoded, UrlUtils.smartEncodeURIComponent(encoded))
    }

    @Test
    fun smartEncodeURIComponent_plainUrl_getsEncoded() {
        val plain = "https://example.com/callback?foo=bar baz"
        val result = UrlUtils.smartEncodeURIComponent(plain)
        assertNotEquals(plain, result)
        assertFalse(result.contains(" "))
    }

    // resolveUrl

    @Test
    fun resolveUrl_withPlainHttpsUrl_returnsAsIs() {
        val url = "https://api.example.com/oauth?client_id=123"
        assertEquals(url, UrlUtils.resolveUrl(url))
    }

    @Test
    fun resolveUrl_withSingleEncodedHttpsUrl_decodesOnce() {
        val encoded = "https%3A%2F%2Fapi.example.com%2Foauth"
        assertEquals("https://api.example.com/oauth", UrlUtils.resolveUrl(encoded))
    }

    @Test
    fun resolveUrl_withDoubleEncodedHttpsUrl_decodesToHttps() {
        val doubleEncoded = "https%253A%252F%252Fapi.example.com%252Foauth"
        assertEquals("https://api.example.com/oauth", UrlUtils.resolveUrl(doubleEncoded))
    }

    @Test
    fun resolveUrl_withTripleEncodedHttpsUrl_decodesToHttps() {
        // Triple-encoded: https%25253A%25252F%25252Fapi.example.com%25252Foauth
        // Requires exactly 3 decodes to reach the plain HTTPS URL
        val tripleEncoded = "https%25253A%25252F%25252Fapi.example.com%25252Foauth"
        assertEquals("https://api.example.com/oauth", UrlUtils.resolveUrl(tripleEncoded))
    }

    @Test
    fun resolveUrl_withNonHttpsUrl_returnsNull() {
        assertNull(UrlUtils.resolveUrl("http://example.com"))
    }

    @Test
    fun resolveUrl_withGarbageString_returnsNull() {
        assertNull(UrlUtils.resolveUrl("not-a-url"))
    }

}
