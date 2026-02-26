import { expect, test } from '@playwright/test'

test('renders Quiltt button and inline connector', async ({ page }) => {
  const response = await page.goto('/')

  expect(response?.ok()).toBeTruthy()
  await expect(page).toHaveTitle(/Quiltt Capacitor Vue Example/)

  const connectorFrame = page.locator('iframe.quiltt-connector')
  await expect(connectorFrame).toHaveCount(1)
  await expect(connectorFrame).toHaveAttribute('src', /^https:\/\/[^/]+\.quiltt\.app\/?/)
  await expect(connectorFrame).toHaveAttribute('src', /(?:\?|&)mode=INLINE(?:&|$)/)

  await page.evaluate(() => {
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://connector.quiltt.app',
        data: {
          source: 'quiltt',
          type: 'Load',
        },
      })
    )
  })

  await expect(page.getByText('Load')).toBeVisible()
})
