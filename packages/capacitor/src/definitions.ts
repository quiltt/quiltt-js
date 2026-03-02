import type { PluginListenerHandle } from '@capacitor/core'

/**
 * Options for opening a URL in the system browser
 */
export interface OpenUrlOptions {
  /**
   * The URL to open in the system browser
   */
  url: string
}

/**
 * Event data when a deep link is received
 */
export interface DeepLinkEvent {
  /**
   * The full URL that was used to open the app, or null if no URL was present
   */
  url: string | null
}

/**
 * Listener function for deep link events
 */
export type DeepLinkListener = (event: DeepLinkEvent) => void

/**
 * The Quiltt Connector Capacitor plugin interface.
 *
 * This plugin handles native functionality required for the Quiltt Connector:
 * - Opening OAuth URLs in the system browser
 * - Handling deep links / App Links / Universal Links for OAuth callbacks
 */
export interface QuilttConnectorPlugin {
  /**
   * Open a URL in the system browser.
   *
   * This is used for OAuth flows where the user needs to authenticate
   * with their financial institution in an external browser.
   *
   * @param options - The options containing the URL to open
   * @returns A promise that resolves when the browser is opened
   *
   * @since 5.0.3
   */
  openUrl(options: OpenUrlOptions): Promise<{ completed: boolean }>

  /**
   * Get the URL that was used to launch the app, if any.
   *
   * This is useful for handling OAuth callbacks when the app is opened
   * from a Universal Link (iOS) or App Link (Android).
   *
   * @returns A promise that resolves with the launch URL, or undefined if none
   *
   * @since 5.0.3
   */
  getLaunchUrl(): Promise<DeepLinkEvent>

  /**
   * Listen for deep link events.
   *
   * This is called when the app is opened via a Universal Link (iOS)
   * or App Link (Android), typically during OAuth callback flows.
   *
   * @param eventName - The event name ('deepLink')
   * @param listenerFunc - The callback function to handle the event
   * @returns A promise that resolves with a handle to remove the listener
   *
   * @since 5.0.3
   */
  addListener(eventName: 'deepLink', listenerFunc: DeepLinkListener): Promise<PluginListenerHandle>

  /**
   * Remove all listeners for this plugin.
   *
   * @since 5.0.3
   */
  removeAllListeners(): Promise<void>
}
