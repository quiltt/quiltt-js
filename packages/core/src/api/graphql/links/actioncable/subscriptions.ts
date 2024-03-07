import type { Consumer } from './consumer'
import logger from './logger'
import type { Data } from './subscription'
import Subscription from './subscription'
import SubscriptionGuarantor from './subscription_guarantor'

// Collection class for creating (and internally managing) channel subscriptions.
// The only method intended to be triggered by the user is ActionCable.Subscriptions#create,
// and it should be called through the consumer like so:
//
//   App = {}
//   App.cable = ActionCable.createConsumer("ws://example.com/accounts/1")
//   App.appearance = App.cable.subscriptions.create("AppearanceChannel")
//
// For more details on how you'd configure an actual channel subscription, see ActionCable.Subscription.

export class Subscriptions {
  consumer: Consumer
  guarantor: SubscriptionGuarantor
  subscriptions: Array<Subscription>

  constructor(consumer: Consumer) {
    this.consumer = consumer
    this.guarantor = new SubscriptionGuarantor(this)
    this.subscriptions = []
  }

  create(channelName: string, mixin: Data) {
    const channel = channelName
    const params = typeof channel === 'object' ? channel : { channel }
    const subscription = new Subscription(this.consumer, params, mixin)
    return this.add(subscription)
  }

  // Private

  add(subscription: Subscription) {
    this.subscriptions.push(subscription)
    this.consumer.ensureActiveConnection()
    this.notify(subscription, 'initialized')
    this.subscribe(subscription)
    return subscription
  }

  remove(subscription: Subscription) {
    this.forget(subscription)
    if (!this.findAll(subscription.identifier).length) {
      this.sendCommand(subscription, 'unsubscribe')
    }
    return subscription
  }

  reject(identifier: string) {
    return this.findAll(identifier).map((subscription) => {
      this.forget(subscription)
      this.notify(subscription, 'rejected')
      return subscription
    })
  }

  forget(subscription: Subscription) {
    this.guarantor.forget(subscription)
    this.subscriptions = this.subscriptions.filter((s) => s !== subscription)
    return subscription
  }

  findAll(identifier: string) {
    return this.subscriptions.filter((s) => s.identifier === identifier)
  }

  reload() {
    return this.subscriptions.map((subscription) => this.subscribe(subscription))
  }

  notifyAll(callbackName: string, ...args: any[]) {
    return this.subscriptions.map((subscription) =>
      this.notify(subscription, callbackName, ...args)
    )
  }

  notify(subscription: Subscription, callbackName: string, ...args: any[]) {
    let subscriptions
    if (typeof subscription === 'string') {
      subscriptions = this.findAll(subscription)
    } else {
      subscriptions = [subscription]
    }

    return subscriptions.map((subscription: any) =>
      typeof subscription[callbackName] === 'function'
        ? subscription[callbackName](...args)
        : undefined
    )
  }

  subscribe(subscription: Subscription) {
    if (this.sendCommand(subscription, 'subscribe')) {
      this.guarantor.guarantee(subscription)
    }
  }

  confirmSubscription(identifier: string) {
    logger.log(`Subscription confirmed ${identifier}`)
    this.findAll(identifier).map((subscription) => this.guarantor.forget(subscription))
  }

  sendCommand(subscription: Subscription, command: string) {
    const { identifier } = subscription
    return this.consumer.send({ command, identifier })
  }
}

export default Subscriptions
