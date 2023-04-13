export const logger =
  typeof self !== 'undefined'
    ? self.console
    : typeof window !== 'undefined'
    ? window.console
    : undefined
export const WebSocket =
  typeof self !== 'undefined'
    ? self.WebSocket
    : typeof window !== 'undefined'
    ? window.WebSocket
    : undefined

export default {
  logger: logger,
  WebSocket: WebSocket,
}
