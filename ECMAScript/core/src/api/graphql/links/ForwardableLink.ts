import { ApolloLink } from '@apollo/client'

export const ForwardableLink = new ApolloLink((operation, forward) => forward(operation))

export default ForwardableLink
