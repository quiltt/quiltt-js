// Custom Error Reporter to avoid hooking into or colliding with a client's Honeybadger singleton
import type { Notice, NoticeTransportPayload } from '@honeybadger-io/core/build/src/types'
import { generateStackTrace, getCauses, makeBacktrace } from '@honeybadger-io/core/build/src/util'

import { version } from '@/version'

const notifier = {
  name: 'Quiltt React Native SDK Reporter',
  url: 'https://www.quiltt.dev/connector/sdk/react-native',
  version: version,
}

type HoneybadgerResponseData = {
  id: string
}

class ErrorReporter {
  private noticeUrl: string
  private apiKey: string
  private logger: Console
  private userAgent: string

  constructor(userAgent: string) {
    this.noticeUrl = 'https://api.honeybadger.io/v1/notices'
    this.apiKey = process.env.HONEYBADGER_API_KEY_REACT_NATIVE || ''
    this.logger = console
    this.userAgent = userAgent
  }

  async notify(error: Error, context?: any): Promise<void> {
    const headers = {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': this.userAgent,
    }

    const payload = await this.buildPayload(error, context)
    const method = 'POST'
    const body = JSON.stringify(payload)
    const mode = 'cors'

    fetch(this.noticeUrl, { headers, method, body, mode })
      .then((response) => {
        if (response.status !== 201) {
          this.logger.warn(
            `Error report failed: unknown response from server. code=${response.status}`
          )
          return
        }
        return response.json()
      })
      .then((data: HoneybadgerResponseData) => {
        if (data) {
          this.logger.info(`Error report sent ⚡ https://app.honeybadger.io/notice/${data?.id}`)
        }
      })
  }

  async buildPayload(error: Error, localContext = {}): Promise<Partial<NoticeTransportPayload>> {
    const notice: Notice = error as Notice
    notice.stack = generateStackTrace()

    notice.backtrace = makeBacktrace(notice.stack)

    return {
      notifier,
      error: {
        class: notice.name as string,
        message: notice.message as string,
        backtrace: notice.backtrace,
        // fingerprint: this.calculateFingerprint(notice),
        tags: notice.tags || [],
        causes: getCauses(notice, this.logger),
      },
      request: {
        url: notice.url,
        component: notice.component,
        action: notice.action,
        context: localContext || {},
        cgi_data: {},
        params: {},
        session: {},
      },
      server: {
        project_root: notice.projectRoot,
        environment_name: this.userAgent,
        revision: version,
        hostname: this.userAgent,
        time: new Date().toUTCString(),
      },
      details: notice.details || {},
    }
  }
}

export { ErrorReporter }
