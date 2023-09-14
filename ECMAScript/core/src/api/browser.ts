interface CallbackManager {
  onEvent(callback: OnEventCallback): void
  onExit(callback: OnEventExitCallback): void
  onExitSuccess(callback: OnExitSuccessCallback): void
  onExitAbort(callback: OnExitAbortCallback): void
  onExitError(callback: OnExitErrorCallback): void

  // Because it's well within React behavior to try to register a billion functions
  offEvent(callback: OnEventCallback): void
  offExit(callback: OnEventExitCallback): void
  offExitSuccess(callback: OnExitSuccessCallback): void
  offExitAbort(callback: OnExitAbortCallback): void
  offExitError(callback: OnExitErrorCallback): void
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
  onEvent?: OnEventCallback
  onExit?: OnEventExitCallback
  onExitSuccess?: OnExitSuccessCallback
  onExitAbort?: OnExitAbortCallback
  onExitError?: OnExitErrorCallback
}

type OnEventCallback = (type: ConnectorSDKEventType, metadata: ConnectorSDKCallbackMetadata) => void

type OnEventExitCallback = (
  type: ConnectorSDKEventType,
  metadata: ConnectorSDKCallbackMetadata
) => void

type OnExitSuccessCallback = (metadata: ConnectorSDKCallbackMetadata) => void
type OnExitAbortCallback = (metadata: ConnectorSDKCallbackMetadata) => void
type OnExitErrorCallback = (metadata: ConnectorSDKCallbackMetadata) => void

export enum ConnectorSDKEventType {
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
