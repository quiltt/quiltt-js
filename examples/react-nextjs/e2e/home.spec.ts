import { expect, test } from '@playwright/test'

const connectorId = process.env.NEXT_PUBLIC_CONNECTOR_ID ?? 'connector'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the home page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Quiltt Next.js Example/)

    // Check main sections are visible
    await expect(page.getByRole('heading', { name: 'Modal launchers' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Container' })).toBeVisible()
  })

  test('should render all launcher buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Launch with HTML' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Launch with Javascript' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Launch with Component' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Launch with Custom Component' })).toBeVisible()
  })

  test('should render container components', async ({ page }) => {
    // Check that containers with quiltt-container attribute exist
    const containers = page.locator(`[quiltt-container="${connectorId}"]`)
    await expect(containers).toHaveCount(2)
  })

  test('should have proper layout structure', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()

    await expect(page.locator('.launchers')).toHaveCount(1)
    await expect(page.locator('.containers')).toHaveCount(1)
    await expect(page.locator('.heading')).toHaveCount(2)
  })
})
