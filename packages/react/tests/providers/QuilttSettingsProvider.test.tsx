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
  return (
    <div data-testid="test">
      ClientId: {settings.clientId}
      Headers: {settings.headers ? JSON.stringify(settings.headers) : 'none'}
    </div>
  )
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

  it('provides headers via context', () => {
    const headers = { 'X-Custom-Header': 'test-value', 'Quiltt-SDK-Agent': 'sdk/1.0' }
    const { getByTestId } = render(
      <QuilttSettingsProvider clientId="test-client" headers={headers}>
        <TestComponent />
      </QuilttSettingsProvider>
    )

    const element = getByTestId('test')
    expect(element.textContent).toContain('X-Custom-Header')
    expect(element.textContent).toContain('test-value')
    expect(element.textContent).toContain('Quiltt-SDK-Agent')
  })

  it('handles undefined headers gracefully', () => {
    const { getByTestId } = render(
      <QuilttSettingsProvider clientId="test-client">
        <TestComponent />
      </QuilttSettingsProvider>
    )

    const element = getByTestId('test')
    expect(element.textContent).toContain('Headers: none')
  })

  it('updates context when headers prop changes', () => {
    const initialHeaders = { 'X-Initial': 'initial' }
    const updatedHeaders = { 'X-Updated': 'updated' }

    const { getByTestId, rerender } = render(
      <QuilttSettingsProvider clientId="test-client" headers={initialHeaders}>
        <TestComponent />
      </QuilttSettingsProvider>
    )

    const element = getByTestId('test')
    expect(element.textContent).toContain('X-Initial')

    rerender(
      <QuilttSettingsProvider clientId="test-client" headers={updatedHeaders}>
        <TestComponent />
      </QuilttSettingsProvider>
    )

    expect(element.textContent).toContain('X-Updated')
    expect(element.textContent).not.toContain('X-Initial')
  })

  it('maintains stable headers reference when value is unchanged', () => {
    // Track context value references across renders
    const contextRefs: Array<Record<string, string> | undefined> = []

    const ContextRefTracker = () => {
      const settings = useQuilttSettings()
      contextRefs.push(settings.headers)
      return <div data-testid="tracker">{JSON.stringify(settings.headers)}</div>
    }

    const { rerender } = render(
      <QuilttSettingsProvider clientId="test-client" headers={{ 'X-Stable': 'stable' }}>
        <ContextRefTracker />
      </QuilttSettingsProvider>
    )

    // Re-render with a new object that has the same values (different reference)
    rerender(
      <QuilttSettingsProvider clientId="test-client" headers={{ 'X-Stable': 'stable' }}>
        <ContextRefTracker />
      </QuilttSettingsProvider>
    )

    // Both renders should have captured the headers
    expect(contextRefs.length).toBe(2)

    // The key test: even though we passed a new object literal with the same values,
    // the context should return the SAME reference due to deep equality optimization
    expect(contextRefs[0]).toBe(contextRefs[1])
  })

  it('updates headers reference when value actually changes', () => {
    const contextRefs: Array<Record<string, string> | undefined> = []

    const ContextRefTracker = () => {
      const settings = useQuilttSettings()
      contextRefs.push(settings.headers)
      return <div data-testid="tracker">{JSON.stringify(settings.headers)}</div>
    }

    const { rerender } = render(
      <QuilttSettingsProvider clientId="test-client" headers={{ 'X-Initial': 'initial' }}>
        <ContextRefTracker />
      </QuilttSettingsProvider>
    )

    // Re-render with actually different values
    rerender(
      <QuilttSettingsProvider clientId="test-client" headers={{ 'X-Changed': 'changed' }}>
        <ContextRefTracker />
      </QuilttSettingsProvider>
    )

    expect(contextRefs.length).toBe(2)

    // When values actually change, references should be different
    expect(contextRefs[0]).not.toBe(contextRefs[1])
    expect(contextRefs[0]).toEqual({ 'X-Initial': 'initial' })
    expect(contextRefs[1]).toEqual({ 'X-Changed': 'changed' })
  })
})
