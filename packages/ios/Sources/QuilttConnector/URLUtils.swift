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
}
