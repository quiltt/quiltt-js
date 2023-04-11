// @ts-nocheck
const extend = function (object, properties) {
  if (properties != null) {
    for (const key in properties) {
      const value = properties[key]
      object[key] = value
    }
  }
  return object
}

export default class Subscription {
  constructor(consumer, params = {}, mixin) {
    this.consumer = consumer
    this.identifier = JSON.stringify(params)
    extend(this, mixin)
  }

  // Perform a channel action with the optional data passed as an attribute
  perform(action, data = {}) {
    data.action = action
    return this.send(data)
  }

  send(data) {
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
