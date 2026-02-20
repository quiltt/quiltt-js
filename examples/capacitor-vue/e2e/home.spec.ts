import { expect, test } from '@playwright/test'

test('home page opens', async ({ page }) => {
  const response = await page.goto('/')

  expect(response?.ok()).toBeTruthy()
  await expect(page).toHaveTitle(/Quiltt Capacitor Vue Example/)
})
