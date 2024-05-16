import { Image, StyleSheet } from 'react-native'
import { ParallaxScrollView } from '@/components/ParallaxScrollView'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useThemeColor } from '@/hooks/useThemeColor'

type PageViewProps = {
  children: React.ReactNode
  title?: React.ReactNode
}

export const PageView = ({ children, title }: PageViewProps) => {
  const muted = useThemeColor({}, 'muted')
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D3C1F0', dark: muted }}
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
    height: 128,
    width: 360,
    bottom: 0,
    left: 0,
    top: 0,
    right: 0,
    position: 'absolute',
  },
})
