import { expect, test } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the home page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Quiltt Nuxt Example/)

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
    await expect(page.locator('.container-frame.quiltt-container')).toHaveCount(2)
    await expect(page.locator('div.container-frame.quiltt-container')).toHaveCount(1)
    await expect(page.locator('section.container-frame.quiltt-container')).toHaveCount(1)
  })

  test('should have proper layout structure', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()

    await expect(page.locator('.launchers')).toHaveCount(1)
    await expect(page.locator('.containers')).toHaveCount(1)
    await expect(page.locator('.heading')).toHaveCount(2)
  })
})
