import crossfetch from 'cross-fetch'

// Use `cross-fetch` only if `fetch` is not available on the `globalThis` object
const effectiveFetch = typeof fetch === 'undefined' ? crossfetch : fetch

type FetchWithRetryOptions = RequestInit & {
  retry?: boolean
  retriesRemaining?: number
  validateStatus?: (status: number) => boolean
}

export type FetchResponse<T> = {
  data: T
  status: number
  statusText: string
  headers: Headers
  ok: boolean
}

const RETRY_DELAY = 150 // ms
const RETRIES = 10 // 150, 300, 450, 600, 750, 900, 1050, 1200, 1350, 1500 = 8.250s

/**
 * A wrapper around the native `fetch` function that adds automatic retries on failure, including network errors and HTTP 429 responses.
 * Now treats any response with status < 500 as valid.
 */
export const fetchWithRetry = async <T>(
  url: RequestInfo,
  options: FetchWithRetryOptions = { retry: false }
): Promise<FetchResponse<T>> => {
  const {
    retry,
    retriesRemaining,
    validateStatus = (status) => status >= 200 && status < 300, // Default to success for 2xx responses
    ...fetchOptions
  } = options

  try {
    const response = await effectiveFetch(url, fetchOptions)

    const isResponseOk = validateStatus(response.status)

    if (isResponseOk) {
      return {
        data: await response.json().catch(() => null),
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        ok: isResponseOk,
      }
    }

    // If validateStatus fails, and retry is enabled, prepare to retry for eligible status codes
    if (retry && (response.status >= 500 || response.status === 429)) {
      throw new Error('Retriable failure')
    }

    throw new Error(`HTTP error with status ${response.status}`)
  } catch (error) {
    if (retry) {
      const currentRetriesRemaining = retriesRemaining !== undefined ? retriesRemaining : RETRIES
      if (currentRetriesRemaining > 0) {
        const delayTime = RETRY_DELAY * (RETRIES - currentRetriesRemaining)
        await new Promise((resolve) => setTimeout(resolve, delayTime))
        return fetchWithRetry(url, {
          ...options,
          retriesRemaining: currentRetriesRemaining - 1,
        })
      }
    }
    return Promise.reject(error)
  }
}
