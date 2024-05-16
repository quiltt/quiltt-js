import { Image, StyleSheet } from 'react-native'

import { ParallaxScrollView } from '@/components/ParallaxScrollView'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'

type PageViewProps = {
  children: React.ReactNode
  title?: React.ReactNode
}

export const PageView = ({ children, title }: PageViewProps) => {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D3C1F0', dark: '#D3C1F0' }}
      headerImage={
        <Image source={require('@/assets/images/quiltt-logo-partial.png')} style={styles.logo} />
      }
    >
      {title ? (
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">{title}</ThemedText>
        </ThemedView>
      ) : null}
      {children}
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  logo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
})
