import { expect, test } from '@playwright/test'

const connectorId = process.env.NEXT_PUBLIC_CONNECTOR_ID ?? 'connector'

test.describe('Connector Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')

    // Wait for script to become interactive
    // This is almost instantaneous locally but takes time in CI
    await page.waitForTimeout(1250)
  })

  test('should launch connector with HTML launcher', async ({ page }) => {
    const iframe = page.locator(`iframe#quiltt--frame[data-quiltt-connector-id="${connectorId}"]`)

    // Click the HTML launcher button
    const button = page.getByRole('button', { name: 'Launch with HTML' })
    await button.click()

    // Iframe should become visible
    await expect(iframe).toBeVisible()

    // TODO: Add more assertions about iframe content when needed
    // const frame = page.frameLocator('iframe#quiltt--frame')
    // await expect(frame.locator('text=Stitching finance together')).toBeVisible()
  })

  test('should launch connector with JavaScript launcher', async ({ page }) => {
    const iframe = page.locator(`iframe#quiltt--frame[data-quiltt-connector-id="${connectorId}"]`)

    const button = page.getByRole('button', { name: 'Launch with Javascript' })
    await button.click()

    await expect(iframe).toBeVisible()
  })

  test('should launch connector with QuilttButton component', async ({ page }) => {
    const iframe = page.locator(`iframe#quiltt--frame[data-quiltt-connector-id="${connectorId}"]`)

    const button = page.getByRole('button', { name: 'Launch with Component' })
    await button.click()

    await expect(iframe).toBeVisible()
  })

  test('should launch connector with custom button component', async ({ page }) => {
    const iframe = page.locator(`iframe#quiltt--frame[data-quiltt-connector-id="${connectorId}"]`)

    const button = page.getByRole('button', { name: 'Launch with Custom Component' })
    await button.click()

    await expect(iframe).toBeVisible()
  })

  test('should display connector in container components', async ({ page }) => {
    // Verify container elements exist
    const containers = page.locator(`[quiltt-container="${connectorId}"]`)
    await expect(containers).toHaveCount(2)

    // Container iframes are rendered at page level with the connector ID, not inside the container elements
    // The SDK creates one iframe per unique connector ID for inline/container mode
    const containerIframes = page.locator(
      `iframe#quiltt--frame[data-quiltt-connector-id="${connectorId}"]`
    )
    await expect(containerIframes).toHaveCount(1, { timeout: 10000 })
    await expect(containerIframes).toBeVisible({ timeout: 10000 })
  })

  test('should allow only one modal connector at a time', async ({ page }) => {
    // Launch first connector
    const htmlButton = page.getByRole('button', { name: 'Launch with HTML' })
    await htmlButton.click()

    const iframe = page.locator(`iframe#quiltt--frame[data-quiltt-connector-id="${connectorId}"]`)
    await expect(iframe).toBeVisible()

    // Click another launcher (force click to bypass modal overlay)
    const jsButton = page.getByRole('button', { name: 'Launch with Javascript' })
    await jsButton.click({ force: true })

    // Should still have one modal iframe (not counting container iframes)
    await expect(
      page.locator(`iframe#quiltt--frame[data-quiltt-connector-id="${connectorId}"]`)
    ).toHaveCount(1)
  })
})
