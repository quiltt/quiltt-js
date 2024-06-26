import Connection from './connection'
import Subscriptions from './subscriptions'

// The ActionCable.Consumer establishes the connection to a server-side Ruby Connection object. Once established,
// the ActionCable.ConnectionMonitor will ensure that its properly maintained through heartbeats and checking for stale updates.
// The Consumer instance is also the gateway to establishing subscriptions to desired channels through the #createSubscription
// method.
//
// The following example shows how this can be set up:
//
//   App = {}
//   App.cable = ActionCable.createConsumer("ws://example.com/accounts/1")
//   App.appearance = App.cable.subscriptions.create("AppearanceChannel")
//
// For more details on how you'd configure an actual channel subscription, see ActionCable.Subscription.
//
// When a consumer is created, it automatically connects with the server.
//
// To disconnect from the server, call
//
//   App.cable.disconnect()
//
// and to restart the connection:
//
//   App.cable.connect()
//
// Any channel subscriptions which existed prior to disconnecting will
// automatically resubscribe.

export class Consumer {
  _url: string
  subscriptions: Subscriptions
  connection: Connection
  subprotocols: Array<string>

  constructor(url: string) {
    this._url = url
    this.subscriptions = new Subscriptions(this)
    this.connection = new Connection(this)
    this.subprotocols = []
  }

  get url() {
    return createWebSocketURL(this._url)
  }

  send(data: object) {
    return this.connection.send(data)
  }

  connect() {
    return this.connection.open()
  }

  disconnect() {
    return this.connection.close({ allowReconnect: false })
  }

  ensureActiveConnection() {
    if (!this.connection.isActive()) {
      return this.connection.open()
    }
  }

  addSubProtocol(subprotocol: string) {
    this.subprotocols = [...this.subprotocols, subprotocol]
  }
}

export function createWebSocketURL(url: string | (() => string)): string {
  if (typeof url === 'function') {
    url = url()
  }

  if (url && !/^wss?:/i.test(url)) {
    const a = document.createElement('a')
    a.href = url
    // biome-ignore lint/correctness/noSelfAssign: <explanation>
    a.href = a.href
    a.protocol = a.protocol.replace('http', 'ws')
    return a.href
  }
  return url
}

export default Consumer
