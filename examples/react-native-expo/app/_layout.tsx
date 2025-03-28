import { useEffect } from 'react'

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import * as Linking from 'expo-linking'

import { QuilttProvider } from '@quiltt/react-native'

import { useColorScheme } from '@/hooks/useColorScheme'

const QUILTT_CLIENT_ID = process.env.EXPO_PUBLIC_QUILTT_CLIENT_ID
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
      <QuilttProvider clientId={QUILTT_CLIENT_ID!} token={QUILTT_AUTH_TOKEN!}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </QuilttProvider>
    </ThemeProvider>
  )
}
