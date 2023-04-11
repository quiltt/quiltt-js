import type { FC, PropsWithChildren } from 'react'

import { ApolloProvider } from '@apollo/client'

import { useQuilttClient } from '../hooks'

export const QuilttGraphQLProvider: FC<PropsWithChildren> = ({ children }) => {
  const client = useQuilttClient()

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export default QuilttGraphQLProvider
