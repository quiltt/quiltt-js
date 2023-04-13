import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'

import { endpointAuth } from '../../config'

export enum AuthStrategies {
  Email = 'email',
  Phone = 'phone',
}

interface EmailInput {
  email: string
  phone?: never
}

interface PhoneInput {
  phone: string
  email?: never
}

export type UsernamePayload = EmailInput | PhoneInput
export type PasscodePayload = UsernamePayload & { passcode: string }

type SessionData = { token: string }
type NoContentData = void
type UnauthorizedData = { message: string; instruction: string }
export type UnprocessableData = { [attribute: string]: Array<string> }

type Ping = SessionData | UnauthorizedData
type Indentify = SessionData | NoContentData | UnprocessableData
type Authenticate = SessionData | UnauthorizedData | UnprocessableData
type Revoke = NoContentData | UnauthorizedData

export type SessionResponse = AxiosResponse<SessionData>
export type UnprocessableResponse = AxiosResponse<UnprocessableData>

// https://www.quiltt.dev/api-reference/rest/auth#
export class AuthAPI {
  clientId: string | undefined

  constructor(clientId?: string | undefined) {
    this.clientId = clientId
  }

  /**
   * Response Statuses:
   *  - 200: OK           -> Session is Valid
   *  - 401: Unauthorized -> Session is Invalid
   */
  ping = (token: string) => {
    return axios.get<Ping>(endpointAuth, this.config(token))
  }

  /**
   * Response Statuses:
   *  - 201: Created              -> Profile Created, New Session Returned
   *  - 202: Accepted             -> Profile Found, MFA Code Sent for `authenticate`
   *  - 422: Unprocessable Entity -> Invalid Payload
   */
  identify = (payload: UsernamePayload) => {
    return axios.post<Indentify>(endpointAuth, this.body(payload), this.config())
  }

  /**
   * Response Statuses:
   *  - 201: Created              -> MFA Validated, New Session Returned
   *  - 401: Unauthorized         -> MFA Invalid
   *  - 422: Unprocessable Entity -> Invalid Payload
   */
  authenticate = (payload: PasscodePayload) => {
    return axios.put<Authenticate>(endpointAuth, this.body(payload), this.config())
  }

  /**
   * Response Statuses:
   *  - 204: No Content   -> Session Revoked
   *  - 401: Unauthorized -> Session Not Found
   */
  revoke = (token: string) => {
    return axios.delete<Revoke>(endpointAuth, this.config(token))
  }

  private config = (token?: string): AxiosRequestConfig => {
    const headers: { [id: string]: string } = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return {
      headers: headers,
      validateStatus: this.validateStatus,
    }
  }

  private validateStatus = (status: number) => status < 500

  private body = (payload: any) => {
    if (!this.clientId) {
      console.error('Quiltt Client ID is not set. Unable to identify & authenticate')
    }

    return {
      session: {
        deploymentId: this.clientId, // Rename API?
        ...payload,
      },
    }
  }
}

export default AuthAPI
