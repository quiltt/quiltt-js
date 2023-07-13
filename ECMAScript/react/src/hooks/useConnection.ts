import { useDisconnectConnection } from './connection'

export const useConnection = (connectionId: string) => {
  const disconnect = useDisconnectConnection(connectionId)

  return {
    disconnect,
  }
}

export default useConnection
