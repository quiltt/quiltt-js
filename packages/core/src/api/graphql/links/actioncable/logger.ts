import { debugging } from '../../../../configuration'
import adapters from './adapters'

class Logger {
  get enabled() {
    return debugging
  }

  log(...messages: Array<string>) {
    if (adapters.logger && this.enabled) {
      messages.push(Date.now().toString())
      adapters.logger.log('[ActionCable]', ...messages)
    }
  }
}

export const logger = new Logger()
export default logger
