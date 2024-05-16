import { StyleSheet } from 'react-native'

import { HelloWave } from '@/components/HelloWave'
import { PageView } from '@/components/PageView'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { ButtonLink } from '@/components/ButtonLink'

export default function HomeScreen() {
  return (
    <PageView
      title={
        <>
          <ThemedText type="title">Welcome!</ThemedText>
          <HelloWave />
        </>
      }
    >
      <ThemedView style={styles.container}>
        <ButtonLink href="/connector">Launch Connector</ButtonLink>
      </ThemedView>
    </PageView>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    marginBottom: 16,
  },
})
