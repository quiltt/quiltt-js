import { ApolloLink } from '@apollo/client/index.js'

export const TerminatingLink = new ApolloLink(() => null)

export default TerminatingLink
