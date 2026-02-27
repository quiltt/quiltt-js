import { expect, test } from '@playwright/test'

const connectorId = process.env.VITE_QUILTT_CONNECTOR_ID ?? 'connector'
const connectorOrigin = `https://${connectorId}.quiltt.app`

test('renders Quiltt button and inline connector', async ({ page }) => {
  const response = await page.goto('/')

  expect(response?.ok()).toBeTruthy()
  await expect(page).toHaveTitle(/Quiltt Capacitor React Example/)

  const launchButton = page.getByRole('button', { name: 'Connect Account' })
  await expect(launchButton).toBeVisible()
  await expect(launchButton).toHaveAttribute('quiltt-app-launcher-uri', /.+/)

  const connectorFrame = page.locator('iframe[title="Quiltt Connector"]')
  await expect(connectorFrame).toHaveCount(1)
  await expect(connectorFrame).toHaveAttribute('src', /^https:\/\/[^/]+\.quiltt\.app\/?/)
  await expect(connectorFrame).toHaveAttribute('src', /(?:\?|&)mode=INLINE(?:&|$)/)

  await page.evaluate((origin) => {
    window.dispatchEvent(
      new MessageEvent('message', {
        origin,
        data: {
          source: 'quiltt',
          type: 'Load',
        },
      })
    )
  }, connectorOrigin)

  await expect(page.getByText('Load')).toBeVisible()
})
