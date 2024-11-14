import { useEffect } from 'react'
import { StyleSheet } from 'react-native'

import { gql, useQuery } from '@quiltt/react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { Colors } from '@/constants/Colors'

const SAMPLE_QUERY = gql`
  query SampleQuery {
    profile {
      id
      name
      email
    }
    connections(filter: { status: [INITIALIZING, SYNCING, SYNCED] }) {
      id
      institution {
        id
        name
      }
    }
  }
`

export default function DataScreen() {
  const { data, error, loading } = useQuery<{
    profile: { id: string; name: string; email: string }
    connections: { id: string; institution: { id: string; name: string } }[]
  }>(SAMPLE_QUERY)

  useEffect(() => {
    if (error) {
      console.error(error)
    }
  }, [error])

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <ThemedText>Loading...</ThemedText>
      ) : (
        <ThemedView style={styles.container}>
          <ThemedView style={styles.container}>
            <ThemedText style={styles.title}>Profile</ThemedText>
            <ThemedText>ID: {data?.profile?.id}</ThemedText>
            <ThemedText>Name: {data?.profile?.name}</ThemedText>
            <ThemedText>Email: {data?.profile?.email}</ThemedText>
          </ThemedView>
          {data?.connections && data?.connections?.length >= 1 ? (
            <ThemedView style={styles.container}>
              <ThemedText style={styles.title}>Connections</ThemedText>
              {data.connections.map((item, index) => (
                <ThemedView
                  key={`${item.id}-${item.institution.id}`}
                  style={
                    index === data.connections.length - 1 ? styles.listItemLast : styles.listItem
                  }
                >
                  <ThemedText>ID: {item.institution.id}</ThemedText>
                  <ThemedText>Name: {item.institution.name}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          ) : null}
        </ThemedView>
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  listItem: {
    gap: 2,
    borderBottomColor: Colors.light.tint,
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  listItemLast: {
    gap: 2,
    borderBottomColor: Colors.light.tint,
    borderBottomWidth: 0,
    paddingVertical: 8,
  },
})
