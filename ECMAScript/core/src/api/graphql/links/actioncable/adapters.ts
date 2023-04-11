const logger =
  typeof self !== 'undefined'
    ? self.console
    : typeof window !== 'undefined'
    ? window.console
    : undefined
const WebSocket =
  typeof self !== 'undefined'
    ? self.WebSocket
    : typeof window !== 'undefined'
    ? window.WebSocket
    : undefined

const adapters = {
  logger: logger,
  WebSocket: WebSocket,
}

export default adapters
