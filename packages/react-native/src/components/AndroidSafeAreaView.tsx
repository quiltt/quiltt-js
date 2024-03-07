import { SafeAreaView, StyleSheet, Platform, StatusBar } from 'react-native'
import { PropsWithChildren } from 'react'

export const AndroidSafeAreaView = ({ children }: PropsWithChildren) => (
  <SafeAreaView style={styles.AndroidSafeArea}>{children}</SafeAreaView>
)

const styles = StyleSheet.create({
  AndroidSafeArea: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
})
