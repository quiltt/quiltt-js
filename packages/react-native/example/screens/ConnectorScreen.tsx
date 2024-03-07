import { NavigationProp } from '@react-navigation/native'

import type { ConnectorSDKCallbackMetadata } from '@quiltt/core'
import { QuilttConnector } from '@quiltt/react-native'

type ConnectorScreenProps = {
  navigation: NavigationProp<any, any>
}

export const ConnectorScreen = ({ navigation }: ConnectorScreenProps) => {
  return (
    <QuilttConnector
      connectorId="mobile-sdk-test"
      oauthRedirectUrl="YOUR_HTTPS_APP_LINK"
      onExitSuccess={(metadata: ConnectorSDKCallbackMetadata) => {
        console.log(metadata.connectionId)
        navigation.navigate('Home')
      }}
      onExitAbort={() => navigation.navigate('Home')}
      onExitError={(metadata: ConnectorSDKCallbackMetadata) => {
        console.log(metadata.connectorId)
        navigation.navigate('Home')
      }}
    />
  )
}
