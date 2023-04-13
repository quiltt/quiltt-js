export default {
  logger: typeof globalThis !== 'undefined' ? globalThis.console : undefined,
  WebSocket: typeof globalThis !== 'undefined' ? globalThis.WebSocket : undefined,
}
