import { endpointWebsockets } from '../../../config'
import { createConsumer } from '@rails/actioncable'
import ActionCableLink from 'graphql-ruby-client/subscriptions/ActionCableLink'

export class SubscriptionLink extends ActionCableLink {
  constructor(token: string | undefined) {
    const endpoint = endpointWebsockets + (token ? `?token=${token}` : '')

    super({
      cable: createConsumer(endpoint),
      channelName: 'GraphQLChannel',
    })
  }

  disconnect() {
    this.cable.disconnect()
  }
}

export default SubscriptionLink
