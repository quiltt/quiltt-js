import { Platform } from 'react-native'

export const IOS_WEBVIEW_PROPS = {
  decelerationRate: 'normal' as const,
  keyboardDisplayRequiresUserAction: false,
  dataDetectorTypes: 'none' as const,
  allowsInlineMediaPlayback: true,
  allowsBackForwardNavigationGestures: false,
  startInLoadingState: true,
  scrollEventThrottle: 16, // Optimize scroll performance
  overScrollMode: 'never' as const, // Prevent overscroll effect
}

export const ANDROID_WEBVIEW_PROPS = {
  androidLayerType: 'hardware' as const,
  cacheEnabled: true,
  cacheMode: 'LOAD_CACHE_ELSE_NETWORK' as const,
}

export const getPlatformSpecificWebViewProps = () => {
  return Platform.OS === 'ios' ? IOS_WEBVIEW_PROPS : ANDROID_WEBVIEW_PROPS
}
