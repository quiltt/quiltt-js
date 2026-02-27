import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'

import { QuilttContainer } from '@/components'
import { useQuilttConnector } from '@/hooks/useQuilttConnector'

vi.mock('@/hooks/useQuilttConnector', () => ({
  useQuilttConnector: vi.fn(),
}))

describe('QuilttContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children correctly', () => {
    const { getByText } = render(
      <QuilttContainer connectorId="mockConnectorId">Container Content</QuilttContainer>
    )
    expect(getByText('Container Content')).toBeDefined()
  })

  it('renders with custom element type', () => {
    const { container } = render(
      <QuilttContainer as="section" connectorId="mockConnectorId">
        Container Content
      </QuilttContainer>
    )
    const sectionElement = container.querySelector('section')
    expect(sectionElement?.tagName.toLowerCase()).toBe('section')
  })

  it('sets container and connection attributes correctly', () => {
    const { container } = render(
      <QuilttContainer connectorId="mockConnectorId" connectionId="test-connection">
        Container Content
      </QuilttContainer>
    )

    const element = container.firstElementChild
    expect(element?.getAttribute('quiltt-container')).toBe('mockConnectorId')
    expect(element?.getAttribute('quiltt-connection')).toBe('test-connection')
  })

  it('passes all callback props to useQuilttConnector', () => {
    const callbacks = {
      onEvent: vi.fn(),
      onLoad: vi.fn(),
      onExit: vi.fn(),
      onExitSuccess: vi.fn(),
      onExitAbort: vi.fn(),
      onExitError: vi.fn(),
    }

    render(
      <QuilttContainer connectorId="mockConnectorId" {...callbacks}>
        Container Content
      </QuilttContainer>
    )

    expect(useQuilttConnector).toHaveBeenCalledWith(
      'mockConnectorId',
      expect.objectContaining(callbacks)
    )
  })

  it('passes appLauncherUrl to useQuilttConnector', () => {
    render(
      <QuilttContainer
        connectorId="mockConnectorId"
        appLauncherUrl="https://app.example.com/quiltt/callback"
      >
        Container Content
      </QuilttContainer>
    )

    expect(useQuilttConnector).toHaveBeenCalledWith(
      'mockConnectorId',
      expect.objectContaining({ appLauncherUrl: 'https://app.example.com/quiltt/callback' })
    )
  })

  it('passes deprecated oauthRedirectUrl to useQuilttConnector for backwards compatibility', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(
      <QuilttContainer
        connectorId="mockConnectorId"
        oauthRedirectUrl="https://app.example.com/quiltt/callback"
      >
        Container Content
      </QuilttContainer>
    )

    expect(useQuilttConnector).toHaveBeenCalledWith(
      'mockConnectorId',
      expect.objectContaining({ appLauncherUrl: 'https://app.example.com/quiltt/callback' })
    )

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('`oauthRedirectUrl` is deprecated')
    )
    consoleWarnSpy.mockRestore()
  })

  it('prefers appLauncherUrl over deprecated oauthRedirectUrl when both provided', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(
      <QuilttContainer
        connectorId="mockConnectorId"
        appLauncherUrl="https://app.example.com/quiltt/callback/new"
        oauthRedirectUrl="https://app.example.com/quiltt/callback/old"
      >
        Container Content
      </QuilttContainer>
    )

    expect(useQuilttConnector).toHaveBeenCalledWith(
      'mockConnectorId',
      expect.objectContaining({ appLauncherUrl: 'https://app.example.com/quiltt/callback/new' })
    )

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('`oauthRedirectUrl` is deprecated')
    )
    consoleWarnSpy.mockRestore()
  })

  it('passes connectionId and institution to useQuilttConnector', () => {
    render(
      <QuilttContainer
        connectorId="mockConnectorId"
        connectionId="test-connection"
        institution="test-bank"
      >
        Container Content
      </QuilttContainer>
    )

    expect(useQuilttConnector).toHaveBeenCalledWith(
      'mockConnectorId',
      expect.objectContaining({
        connectionId: 'test-connection',
        institution: 'test-bank',
      })
    )
  })

  it('renders quiltt-app-launcher-uri attribute on the container element', () => {
    const { container } = render(
      <QuilttContainer
        connectorId="mockConnectorId"
        appLauncherUrl="https://app.example.com/quiltt/callback"
      >
        Container Content
      </QuilttContainer>
    )

    const element = container.firstElementChild
    expect(element?.getAttribute('quiltt-app-launcher-uri')).toBe(
      'https://app.example.com/quiltt/callback'
    )
  })

  it('renders quiltt-institution attribute on the container element', () => {
    const { container } = render(
      <QuilttContainer connectorId="mockConnectorId" institution="test-bank">
        Container Content
      </QuilttContainer>
    )

    const element = container.firstElementChild
    expect(element?.getAttribute('quiltt-institution')).toBe('test-bank')
  })

  it('does not render quiltt-app-launcher-uri attribute when not provided', () => {
    const { container } = render(
      <QuilttContainer connectorId="mockConnectorId">Container Content</QuilttContainer>
    )

    const element = container.firstElementChild
    expect(element?.hasAttribute('quiltt-app-launcher-uri')).toBe(false)
  })

  it('handles nested content correctly', () => {
    const { container } = render(
      <QuilttContainer connectorId="mockConnectorId">
        <div data-testid="nested-div">
          <span data-testid="nested-span">Nested Content</span>
        </div>
      </QuilttContainer>
    )

    const nestedDiv = container.querySelector('[data-testid="nested-div"]')
    const nestedSpan = container.querySelector('[data-testid="nested-span"]')
    expect(nestedDiv).toBeDefined()
    expect(nestedSpan).toBeDefined()
    expect(nestedSpan?.textContent).toBe('Nested Content')
  })

  it('maintains proper typing with custom element types', () => {
    const CustomComponent = ({ className }: { className?: string }) => (
      <div className={className} data-testid="custom-component">
        Custom Component
      </div>
    )

    const { container } = render(
      <QuilttContainer as={CustomComponent} connectorId="mockConnectorId" className="custom-class">
        Content
      </QuilttContainer>
    )

    const component = container.querySelector('[data-testid="custom-component"]')
    expect(component?.className).toBe('custom-class')
  })
})
