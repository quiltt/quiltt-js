// Custom Error Reporter to avoid hooking into or colliding with a client's Honeybadger singleton
import Honeybadger from '@honeybadger-io/react-native'

import { version } from '@/version'

class ErrorReporter {
  private client: typeof Honeybadger

  constructor(userAgent: string) {
    // Create an isolated Honeybadger instance to avoid colliding with client's singleton
    this.client = Honeybadger.factory({
      apiKey: process.env.HONEYBADGER_API_KEY_REACT_NATIVE || '',
      environment: userAgent,
      revision: version,
      reportData: true,
      enableUncaught: false, // Don't hook into global error handlers
      enableUnhandledRejection: false, // Don't hook into global rejection handlers
    })
  }

  async notify(error: Error, context?: any): Promise<void> {
    if (!this.client) {
      console.warn('ErrorReporter: Honeybadger client not initialized')
      return
    }

    try {
      // Set context for this error report
      if (context) {
        this.client.setContext(context)
      }

      // Notify Honeybadger
      await this.client.notify(error)

      // Clear context after reporting
      if (context) {
        this.client.clear()
      }
    } catch (err) {
      console.error('ErrorReporter: Failed to send error report', err)
    }
  }
}

export { ErrorReporter }
