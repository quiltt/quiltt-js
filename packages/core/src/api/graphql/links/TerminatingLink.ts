import { ApolloLink } from '@apollo/client/core/index.js'

export const TerminatingLink = new ApolloLink(() => null)

export default TerminatingLink
