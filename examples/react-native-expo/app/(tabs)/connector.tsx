import { StyleSheet } from 'react-native'

import { router } from 'expo-router'

import { QuilttConnector } from '@quiltt/react-native'
import type { ConnectorSDKCallbackMetadata } from '@quiltt/react-native'

import { ThemedView } from '@/components/ThemedView'

const CONNECTOR_ID = process.env.EXPO_PUBLIC_CONNECTOR_ID
const HTTPS_APP_LINK = process.env.EXPO_PUBLIC_HTTPS_APP_LINK
const INSTITUTION_SEARCH_TERM = process.env.EXPO_PUBLIC_INSTITUTION_SEARCH_TERM

export default function ConnectorScreen() {
  const navigateBack = () => {
    router.canGoBack() ? router.back() : router.push('/(tabs)')
  }

  return (
    <ThemedView style={styles.container} testID="quiltt-connector">
      <QuilttConnector
        connectorId={CONNECTOR_ID!}
        oauthRedirectUrl={HTTPS_APP_LINK!}
        institution={INSTITUTION_SEARCH_TERM}
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
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: '100%',
    paddingBottom: 80,
  },
})
