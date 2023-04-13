import { debugging } from '../../../../config'
import adapters from './adapters'

class Logger {
  enabled = debugging

  log(...messages: Array<any>) {
    if (adapters.logger && this.enabled) {
      messages.push(Date.now())
      adapters.logger.log('[ActionCable]', ...messages)
    }
  }
}

export const logger = new Logger
export default logger
