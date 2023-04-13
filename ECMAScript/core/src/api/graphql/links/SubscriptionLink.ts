import { endpointWebsockets } from '../../../config'
import ActionCableLink from './ActionCableLink'
import { Consumer, createConsumer } from './actioncable'

let cable: Consumer | undefined

export class SubscriptionLink extends ActionCableLink {
  constructor(token: string | undefined) {
    const endpoint = endpointWebsockets + (token ? `?token=${token}` : '')

    if (cable) cable.disconnect()
    cable = createConsumer(endpoint)

    super({ cable, channelName: 'GraphQLChannel' })
  }

  disconnect() {
    this.cable.disconnect()
  }
}

export default SubscriptionLink
