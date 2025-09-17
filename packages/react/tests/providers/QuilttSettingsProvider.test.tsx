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
})
