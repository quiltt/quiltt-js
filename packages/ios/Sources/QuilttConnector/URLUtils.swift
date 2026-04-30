import Foundation

/// Utility functions for handling URL encoding/decoding
class URLUtils {
    /**
     Checks if a string appears to be already URL encoded
     - Parameter string: The string to check
     - Returns: Boolean indicating if the string appears to be URL encoded
     */
    static func isEncoded(_ string: String) -> Bool {
        // Check for typical URL encoding patterns like %20, %3A, etc.
        let hasEncodedChars = string.range(of: "%[0-9A-F]{2}", options: [.regularExpression, .caseInsensitive]) != nil

        // Double-encoded strings (e.g. %253A) are not considered properly encoded
        let hasDoubleEncoding =
            string.range(of: "%25[0-9A-F]{2}", options: [.regularExpression, .caseInsensitive]) != nil

        return hasEncodedChars && !hasDoubleEncoding
    }

    /**
     Smart URL encoder that ensures a string is encoded exactly once
     - Parameter string: The string to encode
     - Returns: A properly URL encoded string
     */
    static func smartEncodeURIComponent(_ string: String) -> String {
        if string.isEmpty { return string }

        // If it's already encoded, return as is
        if isEncoded(string) {
            print("URL already encoded, skipping encoding: \(string)")
            return string
        }

        // Otherwise, encode it
        guard let encoded = string.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)
        else {
            return string
        }
        print("URL encoded from: \(string) to: \(encoded)")
        return encoded
    }

    /**
     Iteratively decodes a URL string until it resolves to a valid HTTPS URL.

     URL parameters may arrive double-encoded (e.g., https%253A%252F%252F...) due to
     how they are passed through the quilttconnector:// scheme. This function decodes
     up to `maxAttempts` times, stopping as soon as the result parses as an HTTPS URL.

     - Parameter urlString: The possibly-encoded URL string
     - Parameter maxAttempts: Maximum number of decode iterations (default 3)
     - Returns: The resolved HTTPS URL string, or nil if it could not be resolved
     */
    static func resolveUrl(_ urlString: String, maxAttempts: Int = 3) -> String? {
        var decoded = urlString
        var attempts = 0

        while attempts < maxAttempts {
            if let url = URL(string: decoded),
               url.scheme?.lowercased() == "https"
            {
                return decoded
            }

            guard let next = decoded.removingPercentEncoding, next != decoded else { break }
            decoded = next
            attempts += 1
        }

        // The last decoded value produced by the loop was never validated
        if let url = URL(string: decoded),
           url.scheme?.lowercased() == "https"
        {
            return decoded
        }

        return nil
    }
}
