import { device } from 'detox'

const launchAppWithRetry = async () => {
  const platform = device.getPlatform()
  const maxAttempts = platform === 'android' ? 3 : 1
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      if (platform === 'ios') {
        await device.launchApp({
          newInstance: true,
          permissions: { notifications: 'YES' },
        })
      } else {
        await device.launchApp({ newInstance: true })
      }

      return
    } catch (error) {
      lastError = error

      if (attempt === maxAttempts) {
        throw error
      }

      await device.terminateApp()
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }
  }

  throw lastError
}

describe('App Navigation and Basic Features', () => {
  beforeAll(async () => {
    await launchAppWithRetry()
  }, 120000)

  it('should launch app without crashing', async () => {
    await device.takeScreenshot('app-launched')
  }, 30000)
})
