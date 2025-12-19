import { expect, test } from '@playwright/experimental-ct-react'

import { TestQuilttContainer } from './TestQuilttContainer'

test.describe('<TestQuilttContainer />', () => {
  test('renders', async ({ mount, page }) => {
    await mount(<TestQuilttContainer />)

    // Find the iframe in the container
    const container = page.locator('div[quiltt-container="container-connector"]')
    const iframe = container.locator('iframe#quiltt--frame')
    await expect(iframe).toBeVisible()
  })
})
