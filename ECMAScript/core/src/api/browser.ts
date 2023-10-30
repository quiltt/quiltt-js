interface CallbackManager {
  onEvent(callback: ConnectorSDKOnEventCallback): void
  onLoad(callback: ConnectorSDKOnEventLoadCallback): void
  onExit(callback: ConnectorSDKOnEventExitCallback): void
  onExitSuccess(callback: ConnectorSDKOnExitSuccessCallback): void
  onExitAbort(callback: ConnectorSDKOnExitAbortCallback): void
  onExitError(callback: ConnectorSDKOnExitErrorCallback): void

  // Because it's well within React behavior to try to register a billion functions
  offEvent(callback: ConnectorSDKOnEventCallback): void
  offLoad(callback: ConnectorSDKOnEventLoadCallback): void
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

export type ConnectorSDKCallbacks = {
  onEvent?: ConnectorSDKOnEventCallback
  onLoad?: ConnectorSDKOnEventLoadCallback
  onExit?: ConnectorSDKOnEventExitCallback
  onExitSuccess?: ConnectorSDKOnExitSuccessCallback
  onExitAbort?: ConnectorSDKOnExitAbortCallback
  onExitError?: ConnectorSDKOnExitErrorCallback
}

export type ConnectorSDKOnEventCallback = (
  type: ConnectorSDKEventType,
  metadata: ConnectorSDKCallbackMetadata
) => void

export type ConnectorSDKOnEventLoadCallback = (
  type: ConnectorSDKEventType.Load,
  metadata: ConnectorSDKCallbackMetadata
) => void

export type ConnectorSDKOnEventExitCallback = (
  type: ConnectorSDKEventType,
  metadata: ConnectorSDKCallbackMetadata
) => void

export type ConnectorSDKOnExitSuccessCallback = (metadata: ConnectorSDKCallbackMetadata) => void
export type ConnectorSDKOnExitAbortCallback = (metadata: ConnectorSDKCallbackMetadata) => void
export type ConnectorSDKOnExitErrorCallback = (metadata: ConnectorSDKCallbackMetadata) => void

export enum ConnectorSDKEventType {
  Load = 'loaded',
  ExitSuccess = 'exited.successful',
  ExitAbort = 'exited.aborted',
  ExitError = 'exited.errored',
}

export type ConnectorSDKCallbackMetadata = {
  connectorId: string
  connectionId?: string
}

export type ConnectorSDKConnectOptions = ConnectorSDKCallbacks
export type ConnectorSDKReconnectOptions = ConnectorSDKCallbacks & {
  connectionId: string
}

export type ConnectorSDKConnectorOptions = ConnectorSDKConnectOptions & {
  connectionId?: string
}
