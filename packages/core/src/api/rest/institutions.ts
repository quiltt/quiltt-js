import { endpointRest } from '@/configuration'

import type { FetchResponse } from './fetchWithRetry'
import { fetchWithRetry } from './fetchWithRetry'
import type { ErrorData, UnauthorizedData } from './types'

export type InstitutionData = { name: string; logoUrl: string }
export type InstitutionsData = Array<InstitutionData>

type Search = InstitutionsData | ErrorData | UnauthorizedData

export type SearchResponse = FetchResponse<InstitutionsData>

export class InstitutionsAPI {
  clientId: string
  agent: string

  constructor(clientId: string, agent = 'web') {
    this.clientId = clientId
    this.agent = agent
  }

  /**
   * Response Statuses:
   *  - 200: OK           -> Institutions Found
   *  - 401: Unauthorized -> Invalid Token
   *  - 400: Bad Request  -> Invalid Request
   */
  search = async (token: string, connectorId: string, term: string, signal?: AbortSignal) => {
    const params = new URLSearchParams()
    params.append('connectorId', connectorId)
    params.append('term', term)

    const response = await fetchWithRetry<Search>(`${endpointRest}/sdk/institutions?${params}`, {
      method: 'GET',
      signal,
      ...this.config(token),
    })
    return response
  }

  private config = (token?: string) => {
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'application/json')
    headers.set('Quiltt-SDK-Agent', this.agent)
    headers.set('Authorization', `Bearer ${token}`)

    return {
      headers,
      validateStatus: this.validateStatus,
      retry: true,
    }
  }

  private validateStatus = (status: number) => status < 500 && status !== 429

  // private body = (payload: any) => {
  //   if (!this.clientId) {
  //     console.error('Quiltt Client ID is not set. Unable to identify & authenticate')
  //   }

  //   return {
  //     session: {
  //       clientId: this.clientId,
  //       ...payload,
  //     },
  //   }
  // }
}
