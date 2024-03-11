import type { ConnectorSDKCallbackMetadata } from '@quiltt/react'
import { QuilttConnector } from '@quiltt/react-native'
import { NavigationProp } from '@react-navigation/native'

type ConnectorScreenProps = {
  navigation: NavigationProp<Record<string, unknown>, string>
}

export const ConnectorScreen = ({ navigation }: ConnectorScreenProps) => {
  return (
    <QuilttConnector
      connectorId="<CONNECTOR_ID>"
      oauthRedirectUrl="<YOUR_HTTPS_APP_LINK>"
      institution="<OPTIONAL_INSTITUION_SEARCH_TERM>"
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
