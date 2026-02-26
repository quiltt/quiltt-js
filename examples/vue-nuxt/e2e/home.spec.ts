import { expect, test } from '@playwright/test'

test('renders Quiltt Vue components', async ({ page }) => {
  const response = await page.goto('/')

  expect(response?.ok()).toBeTruthy()
  await expect(page).toHaveTitle(/Quiltt Nuxt Example/)

  const quilttButton = page.getByRole('button', { name: 'Launch with Component' })

  await expect(quilttButton).toBeVisible()
  await expect(quilttButton).toHaveClass(/quiltt-button/)
  await expect(quilttButton).toHaveClass(/component-button/)

  await expect(page.locator('.container-frame.quiltt-container')).toHaveCount(2)
  await expect(page.locator('div.container-frame.quiltt-container')).toHaveCount(1)
  await expect(page.locator('section.container-frame.quiltt-container')).toHaveCount(1)
})
