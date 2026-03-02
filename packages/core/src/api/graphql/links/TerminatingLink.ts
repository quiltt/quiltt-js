import { ApolloLink } from '@apollo/client/core'
import { Observable } from 'rxjs'

export const TerminatingLink = new ApolloLink(() => {
  return new Observable((observer) => {
    observer.complete()
  })
})
