import * as React from 'react'
import { vi } from 'vitest'

// Mock react-native
const mockPlatform = {
  OS: 'ios',
  Version: '14.0',
  select: vi.fn((obj) => obj.ios),
}

const mockStyleSheet = {
  create: vi.fn((obj) => obj),
  hairlineWidth: 1,
  flatten: vi.fn((style) => style),
}

const mockLinking = {
  openURL: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  canOpenURL: vi.fn(),
  getInitialURL: vi.fn(),
}

vi.mock('react-native', () => ({
  ActivityIndicator: (props: any) => React.createElement('ActivityIndicator', props),
  Button: (props: any) => React.createElement('Button', props),
  Image: (props: any) => React.createElement('Image', props),
  Linking: {
    openURL: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    canOpenURL: vi.fn(),
    getInitialURL: vi.fn(),
  },
  NativeModules: {
    BlobModule: {
      BLOB_URI_SCHEME: 'content',
      BLOB_URI_HOST: 'localhost',
    },
  },
  Platform: {
    OS: 'ios',
    Version: '14.0',
    select: vi.fn((obj) => obj.ios),
  },
  Pressable: (props: any) => React.createElement('Pressable', props),
  SafeAreaView: (props: any) => React.createElement('SafeAreaView', props),
  StyleSheet: {
    create: vi.fn((obj) => obj),
    hairlineWidth: 1,
    flatten: vi.fn((style) => style),
  },
  Text: (props: any) => React.createElement('Text', props),
  View: (props: any) => React.createElement('View', props),
}))

vi.mock('react-native-webview', () => ({
  WebView: (props: any) => React.createElement('WebView', props),
}))

// Export mocks for individual test usage
export { mockLinking, mockPlatform, mockStyleSheet }
