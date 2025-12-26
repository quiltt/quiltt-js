import { expect, test } from '@playwright/experimental-ct-react'

import TestJSLauncher from './TestJSLauncher'

test.describe('<TestJSLauncher />', () => {
  test('renders', async ({ mount, page }) => {
    await mount(<TestJSLauncher />)

    const button = page.locator('button')
    await expect(button).toContainText('Launch with Javascript')

    // Wait for script to become interactive. This is almost instantaneous locally but takes time in CI.
    await page.waitForTimeout(1250)

    // Launch the Connector
    await expect(page.locator('iframe#quiltt--frame')).not.toBeVisible()
    await button.click()
    await expect(page.locator('iframe#quiltt--frame')).toBeVisible()

    // TODO: Check that iframe is rendered with Playwright when needed
    // const frame = page.frameLocator('iframe#quiltt--frame')
    // await expect(frame.locator('text=Stitching finance together')).toBeVisible()
  })
})
