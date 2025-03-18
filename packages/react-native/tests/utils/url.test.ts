import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createUrlWithParams,
  isEncoded,
  normalizeUrlEncoding,
  smartEncodeURIComponent,
} from '@/utils/url'

describe('URL Utilities', () => {
  beforeEach(() => {
    // Spy on console methods
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('isEncoded', () => {
    it('should return true for properly encoded strings', () => {
      const encodedStrings = [
        'Hello%20World',
        'https%3A%2F%2Fexample.com',
        'user%40example.com',
        'path%2Fto%2Fresource',
        'query%3Fparam%3Dvalue',
        '%E2%82%AC%20is%20the%20euro%20symbol',
      ]

      encodedStrings.forEach((str) => {
        expect(isEncoded(str)).toBe(true)
      })
    })

    it('should return false for non-encoded strings', () => {
      const nonEncodedStrings = [
        'Hello World',
        'https://example.com',
        'user@example.com',
        'path/to/resource',
        'query?param=value',
        '€ is the euro symbol',
        '',
        ' ',
      ]

      nonEncodedStrings.forEach((str) => {
        expect(isEncoded(str)).toBe(false)
      })
    })

    it('should return false for double-encoded strings', () => {
      const doubleEncodedStrings = [
        'Hello%2520World',
        'https%253A%252F%252Fexample.com',
        'user%2540example.com',
        '%25E2%2582%25AC%20is%20the%20euro%20symbol',
      ]

      doubleEncodedStrings.forEach((str) => {
        expect(isEncoded(str)).toBe(false)
      })
    })

    it('should handle edge cases correctly', () => {
      // String with % but not followed by hex digits
      expect(isEncoded('50% complete')).toBe(false)

      // String with % followed by single hex digit
      expect(isEncoded('Invalid%2')).toBe(false)

      // String with valid encoding and invalid % character
      expect(isEncoded('valid%20encoding%with%20invalid')).toBe(true)

      // Mixed encoded and non-encoded content
      expect(isEncoded('partially%20encoded string')).toBe(true)
    })
  })

  describe('smartEncodeURIComponent', () => {
    it('should not encode already encoded strings', () => {
      const encodedStrings = ['Hello%20World', 'https%3A%2F%2Fexample.com', 'user%40example.com']

      encodedStrings.forEach((str) => {
        expect(smartEncodeURIComponent(str)).toBe(str)
        expect(console.log).toHaveBeenCalledWith('URL already encoded, skipping encoding:', str)
      })
    })

    it('should encode non-encoded strings', () => {
      const testCases = [
        { input: 'Hello World', expected: 'Hello%20World' },
        { input: 'https://example.com', expected: 'https%3A%2F%2Fexample.com' },
        { input: 'user@example.com', expected: 'user%40example.com' },
        { input: 'path/to/resource', expected: 'path%2Fto%2Fresource' },
        { input: 'query?param=value', expected: 'query%3Fparam%3Dvalue' },
        { input: '€ is the euro symbol', expected: '%E2%82%AC%20is%20the%20euro%20symbol' },
      ]

      testCases.forEach(({ input, expected }) => {
        expect(smartEncodeURIComponent(input)).toBe(expected)
        expect(console.log).toHaveBeenCalledWith('URL encoded from:', input, 'to:', expected)
      })
    })

    it('should handle empty and null inputs', () => {
      expect(smartEncodeURIComponent('')).toBe('')
      expect(smartEncodeURIComponent(null as unknown as string)).toBe(null)
      expect(smartEncodeURIComponent(undefined as unknown as string)).toBe(undefined)
    })
  })

  describe('createUrlWithParams', () => {
    it('should correctly add parameters to a URL', () => {
      const baseUrl = 'https://api.example.com/path'
      const params = {
        key1: 'value1',
        key2: 'value2',
        key3: 'value with spaces',
      }

      const result = createUrlWithParams(baseUrl, params)
      expect(result).toBe(
        'https://api.example.com/path?key1=value1&key2=value2&key3=value+with+spaces'
      )
    })

    it('should handle oauth_redirect_url parameter correctly when already encoded', () => {
      const baseUrl = 'https://api.example.com/path'
      const params = {
        client_id: 'client123',
        oauth_redirect_url: 'https%3A%2F%2Fapp.example.com%2Fcallback',
      }

      const result = createUrlWithParams(baseUrl, params)
      // The oauth_redirect_url parameter should be decoded once before being added to prevent double encoding
      expect(result).toBe(
        'https://api.example.com/path?client_id=client123&oauth_redirect_url=https%3A%2F%2Fapp.example.com%2Fcallback'
      )
    })

    it('should skip null and undefined parameter values', () => {
      const baseUrl = 'https://api.example.com/path'
      const params = {
        key1: 'value1',
        key2: null as unknown as string,
        key3: undefined as unknown as string,
        key4: 'value4',
      }

      const result = createUrlWithParams(baseUrl, params)
      expect(result).toBe('https://api.example.com/path?key1=value1&key4=value4')
    })

    it('should append parameters to URLs that already have query parameters', () => {
      const baseUrl = 'https://api.example.com/path?existing=param'
      const params = {
        key1: 'value1',
        key2: 'value2',
      }

      const result = createUrlWithParams(baseUrl, params)
      expect(result).toBe('https://api.example.com/path?existing=param&key1=value1&key2=value2')
    })

    it('should return the base URL if there is an error', () => {
      const invalidBaseUrl = 'not-a-valid-url'
      const params = {
        key1: 'value1',
      }

      const result = createUrlWithParams(invalidBaseUrl, params)
      expect(result).toBe(invalidBaseUrl)
      expect(console.error).toHaveBeenCalledWith(
        'Error creating URL with params:',
        expect.any(Error)
      )
    })
  })

  describe('normalizeUrlEncoding', () => {
    describe('normalizeUrlEncoding', () => {
      it('should decode double-encoded URLs once', () => {
        const testCases = [
          {
            input: 'https%3A%252F%252Fexample.com',
            expected: 'https:%2F%2Fexample.com',
          },
          {
            input: 'user%2540example.com',
            expected: 'user%40example.com',
          },
          {
            input: 'path%252Fto%252Fresource',
            expected: 'path%2Fto%2Fresource',
          },
          {
            input: 'query%253Fparam%253Dvalue',
            expected: 'query%3Fparam%3Dvalue',
          },
          {
            input: '%25E2%2582%25AC%20is%20the%20euro%20symbol',
            expected: '%E2%82%AC is the euro symbol',
          },
        ]

        testCases.forEach(({ input, expected }) => {
          const result = normalizeUrlEncoding(input)
          expect(result).toBe(expected)
          expect(console.log).toHaveBeenCalledWith('Detected double-encoded URL:', input)
          expect(console.log).toHaveBeenCalledWith('Normalized to:', expected)
        })
      })

      it('should correctly identify double-encoded strings', () => {
        // This test requires accessing the private isDoubleEncoded function
        // If this function isn't directly testable, this test might need to be skipped

        // Testing through normalizeUrlEncoding behavior
        const doubleEncodedStrings = [
          'https%3A%252F%252Fexample.com', // Contains %25
          '%25E2%2582%25AC', // Contains %25
          'path%252Fto', // Contains %25
        ]

        const nonDoubleEncodedStrings = [
          'https%3A%2F%2Fexample.com', // Single-encoded URL
          'user%40example.com', // Single-encoded email
          'plain text', // No encoding
          '', // Empty string
        ]

        doubleEncodedStrings.forEach((str) => {
          const result = normalizeUrlEncoding(str)
          expect(result).not.toBe(str) // Should be decoded
          expect(console.log).toHaveBeenCalledWith('Detected double-encoded URL:', str)
        })

        nonDoubleEncodedStrings.forEach((str) => {
          const result = normalizeUrlEncoding(str)
          expect(result).toBe(str) // Should remain unchanged
          // No log messages expected for non-double-encoded strings
        })
      })
    })

    it('should not modify URLs that are not double-encoded', () => {
      const urls = [
        'https://example.com',
        'https%3A%2F%2Fexample.com', // Regular single-encoded URL
        'user@example.com',
        'path/to/resource',
        'query?param=value',
        '€ is the euro symbol',
      ]

      urls.forEach((url) => {
        expect(normalizeUrlEncoding(url)).toBe(url)
      })
    })

    it('should handle empty strings and null inputs', () => {
      expect(normalizeUrlEncoding('')).toBe('')
      expect(normalizeUrlEncoding(null as unknown as string)).toBe(null)
      expect(normalizeUrlEncoding(undefined as unknown as string)).toBe(undefined)
    })

    it('should handle URLs with % characters that are not part of encoding', () => {
      const url = 'https://example.com/percent%symbol'
      expect(normalizeUrlEncoding(url)).toBe(url)
    })
  })
})
