import { endpointWebsockets } from '../../../../../config'
import ActionCableLink from './ActionCableLink'
import { createConsumer } from './actioncable'

export class SubscriptionLink extends ActionCableLink {
  constructor(token: string | undefined) {
    const endpoint = endpointWebsockets + (token ? `?token=${token}` : '')
    const cable = createConsumer(endpoint)

    super({ cable })
  }
}

export default SubscriptionLink
