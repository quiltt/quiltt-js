export interface ConnectorSDK extends CallbackManager {
  authenticate(token: string | null | undefined): void
  connect(connectorId: string, options?: ConnectOptions): ConnectorSDKConnector
  reconnect(connectorId: string, options: ReconnectOptions): ConnectorSDKConnector
}

export interface ConnectorSDKConnector extends CallbackManager {
  open(): void
}

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

export type Callbacks = {
  onEvent?: OnEventCallback
  onExit?: OnEventExitCallback
  onExitSuccess?: OnExitSuccessCallback
  onExitAbort?: OnExitAbortCallback
  onExitError?: OnExitErrorCallback
}

type OnEventCallback = (type: EventType, metadata: Metadata) => void
type OnEventExitCallback = (type: EventType, metadata: Metadata) => void
type OnExitSuccessCallback = (metadata: Metadata) => void
type OnExitAbortCallback = (metadata: Metadata) => void
type OnExitErrorCallback = (metadata: Metadata) => void

export enum EventType {
  ExitSuccess = 'exited.successful',
  ExitAbort = 'exited.aborted',
  ExitError = 'exited.errored',
}

type Metadata = {
  connectorId: string
  connectionId?: string
}

type ConnectOptions = Callbacks
type ReconnectOptions = Callbacks & {
  connectionId: string
}

export type ConnectorSDKConnectorOptions = Callbacks & {
  connectionId?: string
}
