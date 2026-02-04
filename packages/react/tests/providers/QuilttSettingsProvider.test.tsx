import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'

// Mock the hooks module
vi.mock('@/hooks', async () => {
  const actual: any = await vi.importActual('@/hooks')
  return {
    ...actual,
    QuilttSettings: {
      Provider: ({ children, value }: any) => (
        <actual.QuilttSettings.Provider value={value}>{children}</actual.QuilttSettings.Provider>
      ),
    },
  }
})

import { useQuilttSettings } from '@/hooks'
import { QuilttSettingsProvider } from '@/providers'

const TestComponent = () => {
  const settings = useQuilttSettings()
  return <div data-testid="test">ClientId: {settings.clientId}</div>
}

describe('QuilttSettingsProvider', () => {
  it('renders children correctly', () => {
    const clientId = 'test-client-id'
    const { getByTestId } = render(
      <QuilttSettingsProvider clientId={clientId}>
        <TestComponent />
      </QuilttSettingsProvider>
    )

    const element = getByTestId('test')
    expect(element.textContent).toContain(clientId)
  })

  it('updates context when clientId prop changes', () => {
    const initialClientId = 'initial-client-id'
    const updatedClientId = 'updated-client-id'

    const { getByTestId, rerender } = render(
      <QuilttSettingsProvider clientId={initialClientId}>
        <TestComponent />
      </QuilttSettingsProvider>
    )

    const element = getByTestId('test')
    expect(element.textContent).toContain(initialClientId)

    // Update the clientId prop
    rerender(
      <QuilttSettingsProvider clientId={updatedClientId}>
        <TestComponent />
      </QuilttSettingsProvider>
    )

    // Context should reflect the updated clientId
    expect(element.textContent).toContain(updatedClientId)
    expect(element.textContent).not.toContain(initialClientId)
  })
})
