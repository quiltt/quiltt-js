import { ActivityIndicator, View } from 'react-native'

import { AndroidSafeAreaView } from './AndroidSafeAreaView'

type LoadingScreenProps = {
  testId?: string
}

export const LoadingScreen = ({ testId }: LoadingScreenProps) => (
  <AndroidSafeAreaView testId={testId}>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator testID="activity-indicator" size="large" color="#5928A3" />
    </View>
  </AndroidSafeAreaView>
)
