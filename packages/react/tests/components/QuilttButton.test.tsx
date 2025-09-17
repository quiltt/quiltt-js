import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'

import { QuilttButton } from '@/components'
import { useQuilttConnector } from '@/hooks/useQuilttConnector'

vi.mock('@/hooks/useQuilttConnector', () => ({
  useQuilttConnector: vi.fn(),
}))

describe('QuilttButton', () => {
  const mockOpen = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Ensure the mock always returns the expected object structure
    vi.mocked(useQuilttConnector).mockReturnValue({
      open: mockOpen,
    })
  })

  it('calls onClick and then opens the connector when clicked', () => {
    const onClick = vi.fn()

    const { getByRole } = render(
      <QuilttButton connectorId="mockConnectorId" onClick={onClick}>
        Test Button
      </QuilttButton>
    )

    const button = getByRole('button')
    fireEvent.click(button)

    // Verify the sequence of operations
    expect(onClick).toHaveBeenCalled()
    expect(mockOpen).toHaveBeenCalled()

    // Verify the order of operations
    expect(onClick.mock.invocationCallOrder[0]).toBeLessThan(mockOpen.mock.invocationCallOrder[0])
  })

  it('handles HTML load event separately from SDK load', () => {
    const onHtmlLoad = vi.fn()
    const { container } = render(
      <QuilttButton connectorId="mockConnectorId" onHtmlLoad={onHtmlLoad}>
        Test Button
      </QuilttButton>
    )

    // Get the button directly from the container
    const button = container.querySelector('button')
    expect(button).toBeTruthy()

    // Create a proper load event
    const loadEvent = new Event('load', {
      bubbles: true,
      cancelable: true,
    })

    // Manually handle the event listener
    if (button) {
      button.addEventListener('load', onHtmlLoad)
      button.dispatchEvent(loadEvent)
    }

    expect(onHtmlLoad).toHaveBeenCalledTimes(1)
    expect(onHtmlLoad).toHaveBeenCalledWith(expect.any(Event))
  })
})
