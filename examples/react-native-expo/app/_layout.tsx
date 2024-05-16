import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import 'react-native-reanimated'
import { QuilttProvider } from '@quiltt/react-native'
import { useColorScheme } from '@/hooks/useColorScheme'
import * as Linking from 'expo-linking'

const QUILTT_AUTH_TOKEN = process.env.EXPO_PUBLIC_QUILTT_AUTH_TOKEN

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  /**
   * Use this value for your QuilttConnector.oauthRedirectUrl
   *
   * @example
   * <QuilttConnector oauthRedirectUrl={url} />
   */
  const url = Linking.useURL()

  useEffect(() => {
    // Grab this URL for the QuilttConnector.oauthRedirectUrl
    console.log({ url })
  }, [url])

  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QuilttProvider token={QUILTT_AUTH_TOKEN}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </QuilttProvider>
    </ThemeProvider>
  )
}
