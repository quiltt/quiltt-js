import { WebPlugin } from '@capacitor/core'

import type { DeepLinkEvent, OpenUrlOptions, QuilttConnectorPlugin } from './definitions'

/**
 * Web implementation of the Quiltt Connector plugin.
 *
 * On web, OAuth flows typically work without special handling since
 * the browser handles redirects automatically. This implementation
 * provides basic functionality for web compatibility.
 */
export class QuilttConnectorWeb extends WebPlugin implements QuilttConnectorPlugin {
  /**
   * Open a URL in a new browser tab/window.
   *
   * On web, this simply opens the URL in a new tab using window.open.
   */
  async openUrl(options: OpenUrlOptions): Promise<{ completed: boolean }> {
    window.open(options.url, '_blank', 'noopener,noreferrer')
    return { completed: true }
  }

  /**
   * Get the launch URL on web.
   *
   * On web, we check the current URL for any OAuth callback parameters.
   * This is useful when the user is redirected back to the app after OAuth.
   */
  async getLaunchUrl(): Promise<DeepLinkEvent> {
    const currentUrl = window.location.href

    // Check if the current URL contains OAuth callback parameters
    // Common patterns include: code=, state=, error=
    const url = new URL(currentUrl)
    const hasOAuthParams =
      url.searchParams.has('code') || url.searchParams.has('state') || url.searchParams.has('error')

    if (hasOAuthParams) {
      return { url: currentUrl }
    }

    return { url: null }
  }
}
