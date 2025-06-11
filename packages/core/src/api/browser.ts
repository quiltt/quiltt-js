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
  resetConnector: (connectorId: string) => void // For forcing a reset of a specific connector
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

/**
 * Callback function to handle all events from the Connector.
 * @param type The type of event that was emitted
 * @param metadata Metadata about the event that was emitted
 */
export type ConnectorSDKOnEventCallback = (
  /** The type of event that was emitted */
  type: ConnectorSDKEventType,
  /** The metadata from the event */
  metadata: ConnectorSDKCallbackMetadata
) => void

/** Callback function to handle the Open event */
export type ConnectorSDKOnOpenCallback = (metadata: ConnectorSDKCallbackMetadata) => void

/** Callback function to handle the Load event */
export type ConnectorSDKOnLoadCallback = (metadata: ConnectorSDKCallbackMetadata) => void

/** Callback function to handle all Exit events */
export type ConnectorSDKOnEventExitCallback = (
  type: ConnectorSDKEventType,
  metadata: ConnectorSDKCallbackMetadata
) => void

/** Callback function to handle the ExitSuccess event */
export type ConnectorSDKOnExitSuccessCallback = (metadata: ConnectorSDKCallbackMetadata) => void

/** Callback function to handle the ExitAbort event */
export type ConnectorSDKOnExitAbortCallback = (metadata: ConnectorSDKCallbackMetadata) => void

/** Callback function to handle the ExitError event */
export type ConnectorSDKOnExitErrorCallback = (metadata: ConnectorSDKCallbackMetadata) => void

/**
 * Enum representing the different types of events emitted by the Connector.
 */
export enum ConnectorSDKEventType {
  /** The Connector modal has been opened */
  Open = 'opened',

  /** The Connector has loaded successfully */
  Load = 'loaded',

  /** The end-user successfully completed the flow */
  ExitSuccess = 'exited.successful',

  /** The end-user exited the Connector before completing the flow */
  ExitAbort = 'exited.aborted',

  /** The end-user experienced an error during the flow */
  ExitError = 'exited.errored',
}

/**
 * Metadata about a Connector event
 * @param connectorId The ID of the Connector that emitted the event
 * @param profileId The ID of the authenticated Profile
 * @param connectionId The ID of the Connection that was created or reconnected
 */
export type ConnectorSDKCallbackMetadata = {
  /** The ID of the Connector that emitted the event */
  connectorId: string
  /** The ID of the authenticated Profile */
  profileId?: string
  /** The ID of the Connection that was created or reconnected */
  connectionId?: string
}

/**
  Options for the standard Connect flow
  @param institution The Institution ID or search term to connect
*/
export type ConnectorSDKConnectOptions = ConnectorSDKCallbacks & {
  /** The Institution ID or search term to connect */
  institution?: string
}

/**
 * Options for the Reconnect flow
 * @param connectionId The ID of the Connection to reconnect
 */
export type ConnectorSDKReconnectOptions = ConnectorSDKCallbacks & {
  /** The ID of the Connection to reconnect */
  connectionId: string
}

/** Options to initialize Connector */
// @todo: refactor into a union type - it's either or.
export type ConnectorSDKConnectorOptions = ConnectorSDKCallbacks & {
  /** The Institution ID or search term to connect */
  institution?: string

  /** The ID of the Connection to reconnect */
  connectionId?: string

  /** The nonce to use for the script tag */
  nonce?: string
}
