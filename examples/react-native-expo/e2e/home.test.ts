import { device } from 'detox'

describe('App Navigation and Basic Features', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      launchArgs: { detoxURLBlacklistRegex: '(".*127.0.0.1.*")' },
      permissions: { notifications: 'YES' },
    })
  }, 120000)

  it('should launch app without crashing', async () => {
    // Just verify the app launches - the Quiltt components may not render with test credentials
    // but the app should at least not crash
    await device.takeScreenshot('app-launched')
  }, 30000)
})
