import { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import * as Linking from 'expo-linking'
import { HomeScreen } from './screens/HomeScreen'
import { ConnectorScreen } from './screens/ConnectorScreen'
import { QuilttProvider } from '@quiltt/react'

const Stack = createNativeStackNavigator()

export default function App() {
  const url = Linking.useURL()

  useEffect(() => {
    // log this url and set it to QuilttConnector.oauthRedirectUrl
    console.log(url)
  }, [url])

  const token = 'PUT_A_REAL_TOKEN_HERE'

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
