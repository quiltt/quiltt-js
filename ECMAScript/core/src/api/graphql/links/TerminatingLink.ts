import { ApolloLink } from '@apollo/client'

export const TerminatingLink = new ApolloLink(() => null)

export default TerminatingLink
