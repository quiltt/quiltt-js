import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'

import { QuilttButton } from '@/components'
import { useQuilttConnector } from '@/hooks/useQuilttConnector'

// Mock at module level with a default implementation
vi.mock('@/hooks/useQuilttConnector', () => ({
  useQuilttConnector: vi.fn(),
}))

describe('QuilttButton', () => {
  const mockOpen = vi.fn()

  beforeEach(() => {
    // Clear only the mock function calls, not the implementation
    mockOpen.mockClear()

    // Set implementation
    vi.mocked(useQuilttConnector).mockImplementation(() => ({
      open: mockOpen,
    }))
  })

  afterEach(() => {
    // Clean up after each test
    vi.mocked(useQuilttConnector).mockReset()
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

    expect(onClick).toHaveBeenCalled()
    expect(mockOpen).toHaveBeenCalled()
    expect(onClick.mock.invocationCallOrder[0]).toBeLessThan(mockOpen.mock.invocationCallOrder[0])
  })

  it('handles HTML load event separately from SDK load', () => {
    const onHtmlLoad = vi.fn()
    const { container } = render(
      <QuilttButton connectorId="mockConnectorId" onHtmlLoad={onHtmlLoad}>
        Test Button
      </QuilttButton>
    )

    const button = container.querySelector('button')
    expect(button).toBeTruthy()

    const loadEvent = new Event('load', {
      bubbles: true,
      cancelable: true,
    })

    if (button) {
      button.addEventListener('load', onHtmlLoad)
      button.dispatchEvent(loadEvent)
    }

    expect(onHtmlLoad).toHaveBeenCalledTimes(1)
    expect(onHtmlLoad).toHaveBeenCalledWith(expect.any(Event))
  })

  it('passes appLauncherUrl to useQuilttConnector', () => {
    render(
      <QuilttButton connectorId="mockConnectorId" appLauncherUrl="myapp://oauth">
        Test Button
      </QuilttButton>
    )

    expect(useQuilttConnector).toHaveBeenCalledWith(
      'mockConnectorId',
      expect.objectContaining({ appLauncherUrl: 'myapp://oauth' })
    )
  })

  it('passes deprecated oauthRedirectUrl to useQuilttConnector for backwards compatibility', () => {
    render(
      <QuilttButton connectorId="mockConnectorId" oauthRedirectUrl="myapp://oauth">
        Test Button
      </QuilttButton>
    )

    expect(useQuilttConnector).toHaveBeenCalledWith(
      'mockConnectorId',
      expect.objectContaining({ appLauncherUrl: 'myapp://oauth' })
    )
  })

  it('prefers appLauncherUrl over deprecated oauthRedirectUrl when both provided', () => {
    render(
      <QuilttButton
        connectorId="mockConnectorId"
        appLauncherUrl="myapp://new"
        oauthRedirectUrl="myapp://old"
      >
        Test Button
      </QuilttButton>
    )

    expect(useQuilttConnector).toHaveBeenCalledWith(
      'mockConnectorId',
      expect.objectContaining({ appLauncherUrl: 'myapp://new' })
    )
  })

  it('renders quiltt-app-launcher-uri attribute on the button element', () => {
    const { container } = render(
      <QuilttButton connectorId="mockConnectorId" appLauncherUrl="myapp://oauth">
        Test Button
      </QuilttButton>
    )

    const button = container.querySelector('button')
    expect(button?.getAttribute('quiltt-app-launcher-uri')).toBe('myapp://oauth')
  })

  it('does not render quiltt-app-launcher-uri attribute when not provided', () => {
    const { container } = render(
      <QuilttButton connectorId="mockConnectorId">Test Button</QuilttButton>
    )

    const button = container.querySelector('button')
    expect(button?.hasAttribute('quiltt-app-launcher-uri')).toBe(false)
  })
})
