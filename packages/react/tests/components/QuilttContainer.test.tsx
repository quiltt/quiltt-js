import { fireEvent, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { QuilttContainer } from '@/components'
import { useQuilttConnector } from '@/hooks/useQuilttConnector'

// Mocking the useQuilttConnector hook
vi.mock('@/hooks/useQuilttConnector', () => ({
  useQuilttConnector: vi.fn(), // Mocking the useQuilttConnector hook
}))

describe('QuilttContainer', async () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children correctly', async () => {
    const { getByText } = render(
      <QuilttContainer connectorId="mockConnectorId">Container Content</QuilttContainer>
    )
    expect(getByText('Container Content')).toBeTruthy()
  })

  it('calls useQuilttConnector with the correct arguments', async () => {
    render(<QuilttContainer connectorId="mockConnectorId" />)

    expect(useQuilttConnector).toHaveBeenCalledWith('mockConnectorId', expect.any(Object))
  })

  it('passes other props to the underlying container element', async () => {
    const onClickMock = vi.fn()
    const { getByText } = render(
      <QuilttContainer connectorId="mockConnectorId" onClick={onClickMock}>
        Container Content
      </QuilttContainer>
    )

    // Simulating a click event on the container by clicking on the text content
    fireEvent.click(getByText('Container Content'))

    expect(onClickMock).toHaveBeenCalledTimes(1)
  })
})
