import { QuilttConnector } from '@quiltt/react-native'
import type { ConnectorSDKCallbackMetadata } from '@quiltt/react-native'
import { router } from 'expo-router'

const CONNECTOR_ID = process.env.EXPO_PUBLIC_CONNECTOR_ID
const HTTPS_APP_LINK = process.env.EXPO_PUBLIC_HTTPS_APP_LINK
const INSTITUION_SEARCH_TERM = process.env.EXPO_PUBLIC_INSTITUION_SEARCH_TERM

export default function ExplorerScreen() {
  const navigateBack = () => {
    router.canGoBack() ? router.back() : router.push('(tabs)')
  }

  return (
    <QuilttConnector
      connectorId={CONNECTOR_ID!}
      oauthRedirectUrl={HTTPS_APP_LINK!}
      institution={INSTITUION_SEARCH_TERM}
      onExitSuccess={(metadata: ConnectorSDKCallbackMetadata) => {
        console.log(metadata.connectionId)
        navigateBack()
      }}
      onExitAbort={() => {
        navigateBack()
      }}
      onExitError={(metadata: ConnectorSDKCallbackMetadata) => {
        console.log(metadata.connectorId)
        navigateBack()
      }}
    />
  )
}
