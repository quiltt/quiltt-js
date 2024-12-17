import { ApolloLink } from '@apollo/client/core'

export const TerminatingLink = new ApolloLink(() => null)

export default TerminatingLink
