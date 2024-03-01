import { View, Text, Pressable, StyleSheet } from 'react-native'
import { AndroidSafeAreaView } from './AndroidSafeAreaView'

type ErrorScreenProp = {
  error: string
  cta: () => void
}

export const ErrorScreen = ({ error, cta }: ErrorScreenProp) => (
  <AndroidSafeAreaView>
    <View style={[styles.container, styles.padding]}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: 10,
          }}
        >
          <Text style={[styles.title]}>Cannot connect to the internet.</Text>
        </View>
        <Text style={[styles.subtitle]}>{error}</Text>
      </View>
      {cta && (
        <Pressable style={[styles.pressable]} onPress={cta}>
          <Text style={[styles.pressableText]}>Exit</Text>
        </Pressable>
      )}
    </View>
  </AndroidSafeAreaView>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#F3F4F6',
  },
  title: {
    color: '#1F2937',
    fontSize: 30,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(107, 114, 128, 1)',
  },
  padding: {
    paddingHorizontal: 16, // sm:px-4
    paddingVertical: 24, // sm:py-6
  },
  pressable: {
    marginTop: 20,
    backgroundColor: '#1F2937',
    padding: 10,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  pressableText: {
    color: '#fff',
    textAlign: 'center',
  },
})
