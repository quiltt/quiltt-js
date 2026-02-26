import { endpointRest, version } from '@/config'
import { extractVersionNumber, getUserAgent } from '@/utils/telemetry'

import type { FetchResponse } from './fetchWithRetry'
import { fetchWithRetry } from './fetchWithRetry'
import type { ErrorData, UnauthorizedData } from './types'

export type InstitutionData = { name: string; logoUrl: string }
export type InstitutionsData = Array<InstitutionData>

export type ResolvableData = { resolvable: boolean }

type Search = InstitutionsData | ErrorData | UnauthorizedData
type Resolvable = ResolvableData | ErrorData | UnauthorizedData

export type SearchResponse = FetchResponse<InstitutionsData>
export type ResolvableResponse = FetchResponse<ResolvableData>

export class ConnectorsAPI {
  clientId: string
  userAgent: string
  /**
   * Custom headers to include with every request.
   * For Quiltt internal usage. Not intended for public use.
   * @internal
   */
  customHeaders: Record<string, string> | undefined

  constructor(
    clientId: string,
    userAgent: string = getUserAgent(extractVersionNumber(version), 'Unknown'),
    customHeaders?: Record<string, string>
  ) {
    this.clientId = clientId
    this.userAgent = userAgent
    this.customHeaders = customHeaders
  }

  /**
   * Response Statuses:
   *  - 200: OK           -> Institutions Found
   *  - 401: Unauthorized -> Invalid Token
   *  - 403: Forbidden    -> Unsupported SDK
   *  - 400: Bad Request  -> Invalid Request
   */
  searchInstitutions = async (
    token: string,
    connectorId: string,
    term: string,
    signal?: AbortSignal
  ) => {
    const params = new URLSearchParams()
    params.append('term', term)

    const response = await fetchWithRetry<Search>(
      `${endpointRest}/sdk/connectors/${connectorId}/institutions?${params}`,
      {
        method: 'GET',
        signal,
        ...this.config(token),
      }
    )
    return response
  }

  /**
   * Response Statuses:
   *  - 200: OK           -> Provider API ID is resolvable or not
   *  - 401: Unauthorized -> Invalid Token
   *  - 403: Forbidden    -> Unsupported SDK
   *  - 400: Bad Request  -> Missing provider API ID parameter
   *  - 404: Not Found    -> Connector not found
   */
  checkResolvable = async (
    token: string,
    connectorId: string,
    providerId: { plaid?: string; mock?: string; mx?: string; finicity?: string; akoya?: string },
    signal?: AbortSignal
  ) => {
    const params = new URLSearchParams()

    const providerKey = Object.keys(providerId)[0] as keyof typeof providerId
    if (providerKey && providerId[providerKey]) {
      params.append(providerKey, providerId[providerKey])
    }

    const response = await fetchWithRetry<Resolvable>(
      `${endpointRest}/sdk/connectors/${connectorId}/resolvable?${params}`,
      {
        method: 'GET',
        signal,
        ...this.config(token),
      }
    )
    return response
  }

  private config = (token?: string) => {
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'application/json')
    headers.set('User-Agent', this.userAgent)
    headers.set('Quiltt-SDK-Agent', this.userAgent)

    // Apply custom headers
    if (this.customHeaders) {
      Object.entries(this.customHeaders).forEach(([key, value]) => {
        headers.set(key, value)
      })
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    return {
      headers,
      validateStatus: this.validateStatus,
      retry: true,
    }
  }

  private validateStatus = (status: number) => status < 500 && status !== 429
}
