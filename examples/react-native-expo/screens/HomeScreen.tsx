import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { NavigationProp } from '@react-navigation/native'

type HomeScreenProps = {
  navigation: NavigationProp<Record<string, unknown>, string>
}

export const HomeScreen = ({ navigation }: HomeScreenProps) => (
  <View style={styles.container}>
    <View style={styles.buttonContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('Connector')}>
        <Text style={styles.customBtnText}>Launch Connector</Text>
      </TouchableOpacity>
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    elevation: 8,
    backgroundColor: '#800082',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  customBtnText: {
    color: '#FFFFFF',
  },
})
