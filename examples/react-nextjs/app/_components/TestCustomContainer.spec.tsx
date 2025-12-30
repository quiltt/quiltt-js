import { expect, test } from '@playwright/experimental-ct-react'

import { TestCustomContainer } from './TestCustomContainer'

test.describe('<TestCustomContainer />', () => {
  test('renders', async ({ mount, page }) => {
    await mount(<TestCustomContainer />)

    // Find the iframe in the container
    const container = page.locator('div[quiltt-container="container-connector"]')
    const iframe = container.locator('iframe#quiltt--frame')
    await expect(iframe).toBeVisible()
  })
})
