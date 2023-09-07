import type { AxiosRequestConfig as RequestConfig } from 'axios'
import Axios from 'axios'

export type { AxiosResponse } from 'axios'
export type AxiosRequestConfig<D = any> = RequestConfig<D> & {
  retry: boolean
}

const RETRY_DELAY = 150 // ms
const RETRIES = 3 // 150, 300, 450 = 900 ms

// Create an axios singleton for Quiltt, to prevent mutating other instances
const axios = Axios.create()

// Example: axios.get(url, { retry: true })
axios.interceptors.response.use(undefined, (error) => {
  const { config, message, response } = error
  const messageLower = message.toLowerCase()

  if (!config || !config.retry) {
    return Promise.reject(error)
  }

  // Retry Network timeout, Network errors, and Too Many Requests
  if (
    !(
      messageLower.includes('timeout') ||
      messageLower.includes('network error') ||
      response?.status === 429
    )
  ) {
    return Promise.reject(error)
  }

  if (config.retriesRemaining === undefined) {
    config.retriesRemaining = RETRIES - 1
  } else if (config.retriesRemaining === 1) {
    return Promise.reject(error)
  } else {
    config.retriesRemaining -= 1
  }

  const delay = new Promise<void>((resolve) => {
    setTimeout(() => resolve(), RETRY_DELAY)
  })

  return delay.then(() => axios(config))
})

export { axios }

export default axios
