import { StyleSheet } from 'react-native'
import { ThemedView } from '@/components/ThemedView'
import { QuilttConnector } from '@quiltt/react-native'
import type { ConnectorSDKCallbackMetadata } from '@quiltt/react-native'
import { router } from 'expo-router'
import { PageView } from '@/components/PageView'

const CONNECTOR_ID = process.env.EXPO_PUBLIC_CONNECTOR_ID
const HTTPS_APP_LINK = process.env.EXPO_PUBLIC_HTTPS_APP_LINK
const INSTITUION_SEARCH_TERM = process.env.EXPO_PUBLIC_INSTITUION_SEARCH_TERM

export default function ExplorerScreen() {
  return (
    <QuilttConnector
      connectorId={CONNECTOR_ID!}
      oauthRedirectUrl={HTTPS_APP_LINK!}
      institution={INSTITUION_SEARCH_TERM}
      onExitSuccess={(metadata: ConnectorSDKCallbackMetadata) => {
        console.log(metadata.connectionId)
        router.navigate('/index')
      }}
      onExitAbort={() => router.navigate('/index')}
      onExitError={(metadata: ConnectorSDKCallbackMetadata) => {
        console.log(metadata.connectorId)
        router.navigate('/index')
      }}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginBottom: 8,
    minHeight: '100%',
    width: '100%',
  },
})
