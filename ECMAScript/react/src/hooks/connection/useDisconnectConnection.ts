import { useCallback } from 'react'
import { gql, useMutation } from '@quiltt/core'

const CONNECTION_DISCONNECT = gql`
  mutation ConnectionDelete($id: ID!) {
    connectionDelete(input: { id: $id }) {
      success
    }
  }
`

/**
 * Disconnect a connection by ID
 */
export const useDisconnectConnection = (connectionId: string) => {
  const [executeMutation] = useMutation(CONNECTION_DISCONNECT, {
    variables: { id: connectionId },
  })

  /**
  /* @example: const success = disconnect()
   * @return {boolean}.
   */
  const disconnect = useCallback(async (): Promise<boolean> => {
    const { data } = await executeMutation()

    return data?.connectionDelete?.success || false
  }, [executeMutation])

  return disconnect
}

export default useDisconnectConnection
