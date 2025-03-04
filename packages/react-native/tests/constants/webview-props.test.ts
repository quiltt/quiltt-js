import { Platform } from 'react-native'
import { describe, expect, it } from 'vitest'

import {
  ANDROID_WEBVIEW_PROPS,
  IOS_WEBVIEW_PROPS,
  getPlatformSpecificWebViewProps,
} from '@/constants/webview-props'

describe('WebView Props', () => {
  it('should define iOS-specific props', () => {
    expect(IOS_WEBVIEW_PROPS).toBeDefined()
    expect(IOS_WEBVIEW_PROPS.decelerationRate).toBe('normal')
    expect(IOS_WEBVIEW_PROPS.keyboardDisplayRequiresUserAction).toBe(false)
    expect(IOS_WEBVIEW_PROPS.dataDetectorTypes).toBe('none')
    expect(IOS_WEBVIEW_PROPS.allowsInlineMediaPlayback).toBe(true)
    expect(IOS_WEBVIEW_PROPS.allowsBackForwardNavigationGestures).toBe(false)
    expect(IOS_WEBVIEW_PROPS.startInLoadingState).toBe(true)
    expect(IOS_WEBVIEW_PROPS.scrollEventThrottle).toBe(16)
    expect(IOS_WEBVIEW_PROPS.overScrollMode).toBe('never')
  })

  it('should define Android-specific props', () => {
    expect(ANDROID_WEBVIEW_PROPS).toBeDefined()
    expect(ANDROID_WEBVIEW_PROPS.androidLayerType).toBe('hardware')
    expect(ANDROID_WEBVIEW_PROPS.cacheEnabled).toBe(true)
    expect(ANDROID_WEBVIEW_PROPS.cacheMode).toBe('LOAD_CACHE_ELSE_NETWORK')
  })

  it('should return iOS props when platform is iOS', () => {
    Platform.OS = 'ios'
    const props = getPlatformSpecificWebViewProps()
    expect(props).toEqual(IOS_WEBVIEW_PROPS)
  })

  it('should return Android props when platform is Android', () => {
    Platform.OS = 'android'
    const props = getPlatformSpecificWebViewProps()
    expect(props).toEqual(ANDROID_WEBVIEW_PROPS)
  })
})
