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
