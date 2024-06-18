import type { Consumer } from './consumer'

export type Data = { [id: string]: string | object | null | undefined }

const extend = (object: Data, properties: Data) => {
  if (properties !== null) {
    for (const key in properties) {
      const value = properties[key]
      object[key] = value
    }
  }
  return object
}

export class Subscription {
  consumer: Consumer
  identifier: string

  // biome-ignore lint/style/useDefaultParameterLast: <explanation>
  constructor(consumer: Consumer, params: Data = {}, mixin: Data) {
    this.consumer = consumer
    this.identifier = JSON.stringify(params)
    extend(this as unknown as Data, mixin)
  }

  // Perform a channel action with the optional data passed as an attribute
  perform(action: string, data: Data = {}) {
    data.action = action
    return this.send(data)
  }

  send(data: object) {
    return this.consumer.send({
      command: 'message',
      identifier: this.identifier,
      data: JSON.stringify(data),
    })
  }

  unsubscribe() {
    return this.consumer.subscriptions.remove(this)
  }
}

export default Subscription
