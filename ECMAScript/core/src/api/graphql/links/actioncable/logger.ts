import { debugging } from '../../../../config'
import adapters from './adapters'

class Logger {
  enabled = debugging

  log(...messages: Array<string>) {
    if (adapters.logger && this.enabled) {
      messages.push(Date.now().toString())
      adapters.logger.log('[ActionCable]', ...messages)
    }
  }
}

export const logger = new Logger()
export default logger
