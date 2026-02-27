import { expect, type Page, test } from '@playwright/test'

const connectorId = process.env.NUXT_PUBLIC_CONNECTOR_ID ?? 'connector'
const modalWrapperSelector = '.quiltt--frame-modal-wrapper'

const dismissOpenConnectorModal = async (page: Page) => {
  const modalWrapper = page.locator(modalWrapperSelector)

  if ((await modalWrapper.count()) === 0) {
    return
  }

  await page.keyboard.press('Escape')
  await expect(modalWrapper).toHaveCount(0, { timeout: 5_000 })
}

test.describe('Connector Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('button', { name: 'Launch with HTML' })).toBeVisible()
    await dismissOpenConnectorModal(page)
  })

  test('should launch connector with HTML launcher', async ({ page }) => {
    const iframe = page.locator(`iframe#quiltt--frame[data-quiltt-connector-id="${connectorId}"]`)

    const button = page.getByRole('button', { name: 'Launch with HTML' })
    await button.click()

    await expect(iframe).toBeVisible()
  })

  test('should launch connector with JavaScript launcher', async ({ page }) => {
    const iframe = page.locator(`iframe#quiltt--frame[data-quiltt-connector-id="${connectorId}"]`)

    await dismissOpenConnectorModal(page)

    const button = page.getByRole('button', { name: 'Launch with Javascript' })
    await button.click()

    await expect(iframe).toBeVisible()
  })

  test('should launch connector with QuilttButton component', async ({ page }) => {
    const iframe = page.locator(`iframe#quiltt--frame[data-quiltt-connector-id="${connectorId}"]`)

    await dismissOpenConnectorModal(page)

    const button = page.getByRole('button', { name: 'Launch with Component' })
    await button.click()

    await expect(iframe).toBeVisible()
  })

  test('should launch connector with custom button component', async ({ page }) => {
    const iframe = page.locator(`iframe#quiltt--frame[data-quiltt-connector-id="${connectorId}"]`)

    await dismissOpenConnectorModal(page)

    const button = page.getByRole('button', { name: 'Launch with Custom Component' })
    await button.click()

    await expect(iframe).toBeVisible()
  })

  test('should display connector in container components', async ({ page }) => {
    await expect(page.locator('.container-frame.quiltt-container')).toHaveCount(2)

    const containerIframes = page.locator(
      `iframe#quiltt--frame[data-quiltt-connector-id="${connectorId}"]`
    )
    await expect(containerIframes).toHaveCount(1, { timeout: 10000 })
    await expect(containerIframes).toBeVisible({ timeout: 10000 })
  })

  test('should allow only one modal connector at a time', async ({ page }) => {
    const htmlButton = page.getByRole('button', { name: 'Launch with HTML' })
    await htmlButton.click({ force: true })

    const iframe = page.locator(`iframe#quiltt--frame[data-quiltt-connector-id="${connectorId}"]`)
    await expect(iframe).toBeVisible()

    const jsButton = page.getByRole('button', { name: 'Launch with Javascript' })
    await jsButton.click({ force: true })

    await expect(
      page.locator(`iframe#quiltt--frame[data-quiltt-connector-id="${connectorId}"]`)
    ).toHaveCount(1)
  })
})
