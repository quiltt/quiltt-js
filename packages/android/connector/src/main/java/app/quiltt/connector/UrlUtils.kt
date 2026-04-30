package app.quiltt.connector

import android.net.Uri

object UrlUtils {
    /**
     * Checks if a string appears to be already URL encoded
     */
    fun isEncoded(str: String): Boolean {
        // Check for typical URL encoding patterns like %20, %3A, etc.
        val hasEncodedChars = "%[0-9A-F]{2}".toRegex(RegexOption.IGNORE_CASE).containsMatchIn(str)

        // Double-encoded strings (e.g. %253A) are not considered properly encoded
        val hasDoubleEncoding = "%25[0-9A-F]{2}".toRegex(RegexOption.IGNORE_CASE).containsMatchIn(str)

        return hasEncodedChars && !hasDoubleEncoding
    }
    
    /**
     * Smart URL encoder that ensures a string is encoded exactly once
     */
    fun smartEncodeURIComponent(str: String): String {
        if (str.isEmpty()) return str
        
        // If it's already encoded, return as is
        if (isEncoded(str)) {
            println("URL already encoded, skipping encoding: $str")
            return str
        }
        
        // Otherwise, encode it
        val encoded = Uri.encode(str)
        println("URL encoded from: $str to: $encoded")
        return encoded
    }

    /**
     * Iteratively decodes a URL string until it resolves to a valid HTTPS URL.
     *
     * URL parameters may arrive double-encoded (e.g., https%253A%252F%252F...) due to
     * how they are passed through the quilttconnector:// scheme. This function decodes
     * up to [maxAttempts] times, stopping as soon as the result parses as an HTTPS URL.
     *
     * @param urlString The possibly-encoded URL string
     * @param maxAttempts Maximum number of decode iterations (default 3)
     * @return The resolved HTTPS URL string, or null if it could not be resolved
     */
    fun resolveUrl(urlString: String, maxAttempts: Int = 3): String? {
        var decoded = urlString
        var attempts = 0

        while (attempts < maxAttempts) {
            val uri = Uri.parse(decoded)
            if (uri.scheme?.equals("https", ignoreCase = true) == true) {
                return decoded
            }

            val next = Uri.decode(decoded)
            if (next == decoded) break
            decoded = next
            attempts++
        }

        // The last decoded value produced by the loop was never validated
        val uri = Uri.parse(decoded)
        if (uri.scheme?.equals("https", ignoreCase = true) == true) {
            return decoded
        }

        return null
    }
}