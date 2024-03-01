// Quick hack to send error to Honeybadger to debug why the connector is not routable

import type {
  Notice,
  Noticeable,
  NoticeTransportPayload,
} from '@honeybadger-io/core/build/src/types'
import { generateStackTrace, getCauses, makeBacktrace } from '@honeybadger-io/core/build/src/util'

import { ErrorReporterConfig } from './ErrorReporterConfig'
import { version } from '../version'

const notifier = {
  name: 'Quiltt React Native SDK Reporter',
  url: 'https://www.quiltt.dev/guides/connector/react-native',
  version: version,
}

type HoneybadgerResponseData = {
  id: string
}

export class ErrorReporter {
  private noticeUrl: string
  private apiKey: string
  private clientName: string
  private clientVersion: string
  private platform: string
  private logger: Console
  private userAgent: string

  constructor(platform: string) {
    this.noticeUrl = 'https://api.honeybadger.io/v1/notices'
    this.apiKey = ErrorReporterConfig.honeybadger_api_key
    this.clientName = 'react-native-sdk'
    this.clientVersion = version
    this.platform = platform
    this.logger = console
    this.userAgent = `${this.clientName} ${this.clientVersion}; ${this.platform}`
  }

  async send(error: Error, context?: any): Promise<void> {
    const headers = {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': `${this.clientName} ${this.clientVersion}; ${this.platform}`,
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
        hostname: this.platform,
        time: new Date().toUTCString(),
      },
      details: notice.details || {},
    }
  }
}
