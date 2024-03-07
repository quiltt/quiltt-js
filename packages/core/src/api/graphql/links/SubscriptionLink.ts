'use client'

import ActionCableLink from './ActionCableLink'

export class SubscriptionLink extends ActionCableLink {
  constructor() {
    super({ channelName: 'GraphQLChannel' })
  }
}

export default SubscriptionLink
