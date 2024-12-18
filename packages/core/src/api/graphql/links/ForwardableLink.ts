import { ApolloLink } from '@apollo/client/core'

export const ForwardableLink = new ApolloLink((operation, forward) => forward(operation))

export default ForwardableLink
