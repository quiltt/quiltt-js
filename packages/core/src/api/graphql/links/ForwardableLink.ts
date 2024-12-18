import { ApolloLink } from '@apollo/client/core/index.js'

export const ForwardableLink = new ApolloLink((operation, forward) => forward(operation))

export default ForwardableLink
