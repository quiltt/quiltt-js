import { FetchResponse } from "./fetchWithRetry";

export type NoContentData = null
export type ErrorData = { message: string, instruction: string, error_id: string }
export type UnauthorizedData = { message: string; instruction: string }
export type UnprocessableData = { [attribute: string]: Array<string> }

export type BadRequestResponse = FetchResponse<ErrorData>
export type UnauthorizedResponse = FetchResponse<UnauthorizedData>
export type UnprocessableResponse = FetchResponse<UnprocessableData>
