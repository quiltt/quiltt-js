import { createConsumer } from '@rails/actioncable'

import ActionCableLink from 'graphql-ruby-client/subscriptions/ActionCableLink'

import { endpointWebsockets } from '../../../../config'

export class SubscriptionLink extends ActionCableLink {
  constructor(token: string | undefined) {
    const endpoint = endpointWebsockets + (token ? `?token=${token}` : '')
    const cable = createConsumer(endpoint)
    const channelName = 'GraphQLChannel'

    super({ cable, channelName })
  }
}

export default SubscriptionLink
