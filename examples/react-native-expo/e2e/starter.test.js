const { device, element, by, expect, waitFor } = require('detox')

describe('App Navigation and Basic Features', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      launchArgs: { detoxURLBlacklistRegex: '(".*127.0.0.1.*")' },
    })
  }, 120000)

  it('should show home tab', async () => {
    await waitFor(element(by.text('Home')))
      .toBeVisible()
      .withTimeout(10000)
  }, 45000)
})
