interface CallbackManager {
  onEvent(callback: ConnectorSDKOnEventCallback): void
  onLoad(callback: ConnectorSDKOnLoadCallback): void
  onAuthenticate(callback: ConnectorSDKOnAuthenticateCallback): void
  onExit(callback: ConnectorSDKOnEventExitCallback): void
  onExitSuccess(callback: ConnectorSDKOnExitSuccessCallback): void
  onExitAbort(callback: ConnectorSDKOnExitAbortCallback): void
  onExitError(callback: ConnectorSDKOnExitErrorCallback): void

  // Because it's well within React behavior to try to register a billion functions
  offEvent(callback: ConnectorSDKOnEventCallback): void
  offLoad(callback: ConnectorSDKOnLoadCallback): void
  offAuthenticate(callback: ConnectorSDKOnAuthenticateCallback): void
  offExit(callback: ConnectorSDKOnEventExitCallback): void
  offExitSuccess(callback: ConnectorSDKOnExitSuccessCallback): void
  offExitAbort(callback: ConnectorSDKOnExitAbortCallback): void
  offExitError(callback: ConnectorSDKOnExitErrorCallback): void
}

export interface ConnectorSDK extends CallbackManager {
  authenticate(token: string | null | undefined): void
  connect(connectorId: string, options?: ConnectorSDKConnectOptions): ConnectorSDKConnector
  reconnect(connectorId: string, options: ConnectorSDKReconnectOptions): ConnectorSDKConnector

  reset(): void
}

export interface ConnectorSDKConnector extends CallbackManager {
  open(): void
}

/**
 * Types for optional callbacks in the ConnectorSDK.
 *
 * Leaf event nodes return only metadata.
 * Internal nodes return both event type and metadata.
 */
export type ConnectorSDKCallbacks = {
  onEvent?: ConnectorSDKOnEventCallback
  onLoad?: ConnectorSDKOnLoadCallback
  onAuthenticate?: ConnectorSDKOnAuthenticateCallback
  onExit?: ConnectorSDKOnEventExitCallback
  onExitSuccess?: ConnectorSDKOnExitSuccessCallback
  onExitAbort?: ConnectorSDKOnExitAbortCallback
  onExitError?: ConnectorSDKOnExitErrorCallback
}

export type ConnectorSDKOnEventCallback = (
  type: ConnectorSDKEventType,
  metadata: ConnectorSDKCallbackMetadata
) => void

export type ConnectorSDKOnLoadCallback = (metadata: ConnectorSDKCallbackMetadata) => void
export type ConnectorSDKOnAuthenticateCallback = (metadata: ConnectorSDKCallbackMetadata) => void

export type ConnectorSDKOnEventExitCallback = (
  type: ConnectorSDKEventType,
  metadata: ConnectorSDKCallbackMetadata
) => void

export type ConnectorSDKOnExitSuccessCallback = (metadata: ConnectorSDKCallbackMetadata) => void
export type ConnectorSDKOnExitAbortCallback = (metadata: ConnectorSDKCallbackMetadata) => void
export type ConnectorSDKOnExitErrorCallback = (metadata: ConnectorSDKCallbackMetadata) => void

export enum ConnectorSDKEventType {
  Load = 'loaded',
  Authenticate = 'authenticated',
  ExitSuccess = 'exited.successful',
  ExitAbort = 'exited.aborted',
  ExitError = 'exited.errored',
}

export type ConnectorSDKCallbackMetadata = {
  connectorId: string
  connectionId?: string
  profileId?: string
}

export type ConnectorSDKConnectOptions = ConnectorSDKCallbacks
export type ConnectorSDKReconnectOptions = ConnectorSDKCallbacks & {
  connectionId: string
}

export type ConnectorSDKConnectorOptions = ConnectorSDKConnectOptions & {
  connectionId?: string
}
