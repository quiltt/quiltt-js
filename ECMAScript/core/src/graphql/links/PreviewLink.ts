import { ApolloLink } from '@apollo/client'

// If request is a preview mutation, then terminates chain and directly calls
// the api with the preview header set. Any requests made in preview mode will
// be rolled back.
// TODO Super Deprecated, Should removed with Roundups Refactor
export const PreviewLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      'Quiltt-Preview': true,
    },
  }))
  return forward(operation)
})

export default PreviewLink
