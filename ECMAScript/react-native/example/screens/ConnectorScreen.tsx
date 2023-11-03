import { NavigationProp } from '@react-navigation/native'

import type { ConnectorSDKCallbackMetadata } from '@quiltt/core'
import { QuilttConnector } from '@quiltt/react-native'

type ConnectorScreenProps = {
  navigation: NavigationProp<any, any>
}

export const ConnectorScreen = ({ navigation }: ConnectorScreenProps) => {
  return (
    <QuilttConnector
      connectorId="PUT_A_REAL_CONNECTOR_ID_HERE"
      oauthRedirectUrl="exp://10.0.0.112:8081"
      onExitSuccess={(metadata: ConnectorSDKCallbackMetadata) => {
        console.log(metadata.connectionId)
        navigation.navigate('Home')
      }}
      onExitAbort={() => navigation.navigate('Home')}
    />
  )
}
