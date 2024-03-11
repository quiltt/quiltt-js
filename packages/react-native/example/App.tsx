import { useEffect } from 'react'

import { QuilttProvider } from '@quiltt/react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import * as Linking from 'expo-linking'
import { StatusBar } from 'expo-status-bar'

import { ConnectorScreen } from './screens/ConnectorScreen'
import { HomeScreen } from './screens/HomeScreen'

const Stack = createNativeStackNavigator()

export default function App() {
  const url = Linking.useURL()

  useEffect(() => {
    // log this url and set it to QuilttConnector.oauthRedirectUrl
    console.log(url)
  }, [url])

  // See: https://www.quiltt.dev/api-reference/rest/auth#/paths/~1v1~1users~1sessions/post
  const token = 'GET_THIS_TOKEN_FROM_YOUR_SERVER'

  return (
    <QuilttProvider token={token}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            options={{ headerShown: false }}
            name="Connector"
            component={ConnectorScreen}
          />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </QuilttProvider>
  )
}
