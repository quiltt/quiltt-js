import { render, fireEvent } from '@testing-library/react'
import { QuilttButton } from '@/components'
import { useQuilttConnector } from '@/hooks/useQuilttConnector'
import { describe, expect, it, vi } from 'vitest'

// Mocking the useQuilttConnector hook
vi.mock('@/hooks/useQuilttConnector', () => ({
  useQuilttConnector: vi
    .fn(() => ({
      open: vi.fn(), // Mocking the open function
    }))
    .mockReturnValue({ open: vi.fn() }), // Mocking the return value of useQuilttConnector to include open function
}))

describe('QuilttButton', async () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children correctly', async () => {
    const { getByText } = render(
      <QuilttButton connectorId="mockConnectorId">Click me</QuilttButton>
    )
    expect(getByText('Click me')).toBeTruthy()
  })

  it('calls open function from useQuilttConnector when clicked', async () => {
    const { getByText } = render(
      <QuilttButton connectorId="mockConnectorId">Click me</QuilttButton>
    )
    fireEvent.click(getByText('Click me'))
    expect(useQuilttConnector().open).toHaveBeenCalledTimes(1) // Accessing the mock function directly
  })

  it('passes other props to the underlying button element', async () => {
    const onClickMock = vi.fn()
    const { getByText } = render(
      <QuilttButton connectorId="mockConnectorId" onClick={onClickMock}>
        Click me
      </QuilttButton>
    )
    fireEvent.click(getByText('Click me'))
    expect(onClickMock).toHaveBeenCalledTimes(1)
  })
})
