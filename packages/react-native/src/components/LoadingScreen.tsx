import { ActivityIndicator, View } from 'react-native'
import { AndroidSafeAreaView } from './AndroidSafeAreaView'

export const LoadingScreen = () => (
  <AndroidSafeAreaView>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  </AndroidSafeAreaView>
)
