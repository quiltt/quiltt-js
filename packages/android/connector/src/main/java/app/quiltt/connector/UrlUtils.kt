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
}