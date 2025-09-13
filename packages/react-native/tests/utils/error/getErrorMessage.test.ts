import { describe, expect, it } from 'vitest'

import { getErrorMessage } from '@/utils/error/getErrorMessage'

describe('getErrorMessage', () => {
  it('returns correct message when an Error is provided', () => {
    const error = new Error('Something went wrong')
    error.name = 'TestError'
    const result = getErrorMessage(undefined, error)
    expect(result).toBe(
      'An error occurred while checking the Connector URL: TestError \nSomething went wrong'
    )
  })

  it('returns correct message when a response status is provided', () => {
    const responseStatus = 403
    const result = getErrorMessage(responseStatus)
    expect(result).toBe('An error occurred loading the Connector. Response status: 403')
  })

  it('returns a generic error message when no arguments are provided', () => {
    const result = getErrorMessage()
    expect(result).toBe('An error occurred while checking the Connector URL')
  })
})
