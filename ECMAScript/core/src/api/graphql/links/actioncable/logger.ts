// @ts-nocheck
import adapters from './adapters'

const logger = {
  log(...messages: Array<any>) {
    if (this.enabled) {
      messages.push(Date.now())
      adapters.logger.log('[ActionCable]', ...messages)
    }
  },
}

export default logger
