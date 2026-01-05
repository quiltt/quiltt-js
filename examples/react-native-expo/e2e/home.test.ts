import { device } from 'detox'

describe('App Navigation and Basic Features', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    })
  }, 120000)

  it('should launch app without crashing', async () => {
    await device.takeScreenshot('app-launched')
  }, 30000)
})
