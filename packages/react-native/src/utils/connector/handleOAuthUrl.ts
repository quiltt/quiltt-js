import { Linking } from 'react-native'

export const handleOAuthUrl = (oauthUrl: URL) => {
  if (oauthUrl.protocol !== 'https:') {
    console.log(`handleOAuthUrl - Skipping non https url - ${oauthUrl.href}`)
    return
  }
  Linking.openURL(oauthUrl.href)
}
