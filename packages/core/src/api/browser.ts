interface CallbackManager {
  onEvent(callback: ConnectorSDKOnEventCallback): void
  onOpen(callback: ConnectorSDKOnOpenCallback): void
  onLoad(callback: ConnectorSDKOnLoadCallback): void
  onExit(callback: ConnectorSDKOnEventExitCallback): void
  onExitSuccess(callback: ConnectorSDKOnExitSuccessCallback): void
  onExitAbort(callback: ConnectorSDKOnExitAbortCallback): void
  onExitError(callback: ConnectorSDKOnExitErrorCallback): void

  // Because it's well within React behavior to try to register a billion functions
  offEvent(callback: ConnectorSDKOnEventCallback): void
  offOpen(callback: ConnectorSDKOnOpenCallback): void
  offLoad(callback: ConnectorSDKOnLoadCallback): void
  offExit(callback: ConnectorSDKOnEventExitCallback): void
  offExitSuccess(callback: ConnectorSDKOnExitSuccessCallback): void
  offExitAbort(callback: ConnectorSDKOnExitAbortCallback): void
  offExitError(callback: ConnectorSDKOnExitErrorCallback): void
}

export interface ConnectorSDK extends CallbackManager {
  authenticate(token: string | null | undefined): void
  connect(connectorId: string, options?: ConnectorSDKConnectOptions): ConnectorSDKConnector
  reconnect(connectorId: string, options: ConnectorSDKReconnectOptions): ConnectorSDKConnector

  reset(): void // For Test and Development Use
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
  onOpen?: ConnectorSDKOnOpenCallback
  onLoad?: ConnectorSDKOnLoadCallback
  onExit?: ConnectorSDKOnEventExitCallback
  onExitSuccess?: ConnectorSDKOnExitSuccessCallback
  onExitAbort?: ConnectorSDKOnExitAbortCallback
  onExitError?: ConnectorSDKOnExitErrorCallback
}

export type ConnectorSDKOnEventCallback = (
  type: ConnectorSDKEventType,
  metadata: ConnectorSDKCallbackMetadata
) => void

export type ConnectorSDKOnOpenCallback = (metadata: ConnectorSDKCallbackMetadata) => void
export type ConnectorSDKOnLoadCallback = (metadata: ConnectorSDKCallbackMetadata) => void

export type ConnectorSDKOnEventExitCallback = (
  type: ConnectorSDKEventType,
  metadata: ConnectorSDKCallbackMetadata
) => void

export type ConnectorSDKOnExitSuccessCallback = (metadata: ConnectorSDKCallbackMetadata) => void
export type ConnectorSDKOnExitAbortCallback = (metadata: ConnectorSDKCallbackMetadata) => void
export type ConnectorSDKOnExitErrorCallback = (metadata: ConnectorSDKCallbackMetadata) => void

export enum ConnectorSDKEventType {
  Open = 'opened',
  Load = 'loaded',
  ExitSuccess = 'exited.successful',
  ExitAbort = 'exited.aborted',
  ExitError = 'exited.errored',
}

export type ConnectorSDKCallbackMetadata = {
  connectorId: string
  profileId?: string
  connectionId?: string
}

export type ConnectorSDKConnectOptions = ConnectorSDKCallbacks & {
  institution?: string
}

export type ConnectorSDKReconnectOptions = ConnectorSDKCallbacks & {
  connectionId: string
}

export type ConnectorSDKConnectorOptions = ConnectorSDKCallbacks & {
  institution?: string
  connectionId?: string
}
