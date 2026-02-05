import { describe, expect, it } from 'vitest'

import SubscriptionLink from '@/api/graphql/links/SubscriptionLink'

describe('SubscriptionLink', () => {
  it('should extend ActionCableLink properly', () => {
    const link = new SubscriptionLink()
    expect(link).toBeInstanceOf(SubscriptionLink)
    expect(link.request).toBeInstanceOf(Function)
  })

  it('should use GraphQLChannel as the default channel name', () => {
    const link = new SubscriptionLink()
    expect(link.channelName).toBe('GraphQLChannel')
  })

  it('should use execute as the default action name', () => {
    const link = new SubscriptionLink()
    expect(link.actionName).toBe('execute')
  })
})
