import { PropsWithChildren } from 'react'

import { SafeAreaView, StyleSheet, Platform, StatusBar } from 'react-native'

type AndroidSafeAreaViewProps = PropsWithChildren & {
  testId?: string
}

export const AndroidSafeAreaView = ({ testId, children }: AndroidSafeAreaViewProps) => (
  <SafeAreaView testID={testId} style={styles.AndroidSafeArea}>
    {children}
  </SafeAreaView>
)

const styles = StyleSheet.create({
  AndroidSafeArea: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
})
