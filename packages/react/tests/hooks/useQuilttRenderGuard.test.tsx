import type { PropsWithChildren } from 'react'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, renderHook } from '@testing-library/react'

import { QuilttProviderRender } from '@/contexts/QuilttProviderRender'
import { useQuilttRenderGuard } from '@/hooks/useQuilttRenderGuard'

describe('useQuilttRenderGuard', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    cleanup()
    consoleErrorSpy.mockRestore()
  })

  it('does not log error when no provider context is available', () => {
    renderHook(() => useQuilttRenderGuard('QuilttButton'))

    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })

  it('does not log error when isRenderingProvider is false', () => {
    const Wrapper = ({ children }: PropsWithChildren) => (
      <QuilttProviderRender.Provider value={{ isRenderingProvider: false }}>
        {children}
      </QuilttProviderRender.Provider>
    )

    renderHook(() => useQuilttRenderGuard('QuilttButton'), {
      wrapper: Wrapper,
    })

    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })

  it('logs error when isRenderingProvider is true', () => {
    const Wrapper = ({ children }: PropsWithChildren) => (
      <QuilttProviderRender.Provider value={{ isRenderingProvider: true }}>
        {children}
      </QuilttProviderRender.Provider>
    )

    renderHook(() => useQuilttRenderGuard('QuilttButton'), {
      wrapper: Wrapper,
    })

    expect(consoleErrorSpy).toHaveBeenCalledOnce()
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('POTENTIAL ANTI-PATTERN')
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('QuilttButton')
  })

  it('includes component name in error message', () => {
    const componentName = 'MyCustomComponent'

    const Wrapper = ({ children }: PropsWithChildren) => (
      <QuilttProviderRender.Provider value={{ isRenderingProvider: true }}>
        {children}
      </QuilttProviderRender.Provider>
    )

    renderHook(() => useQuilttRenderGuard(componentName), {
      wrapper: Wrapper,
    })

    expect(consoleErrorSpy).toHaveBeenCalledOnce()
    expect(consoleErrorSpy.mock.calls[0][0]).toContain(componentName)
  })

  it('includes helpful fix instructions in error message', () => {
    const Wrapper = ({ children }: PropsWithChildren) => (
      <QuilttProviderRender.Provider value={{ isRenderingProvider: true }}>
        {children}
      </QuilttProviderRender.Provider>
    )

    renderHook(() => useQuilttRenderGuard('QuilttButton'), {
      wrapper: Wrapper,
    })

    const errorMessage = consoleErrorSpy.mock.calls[0][0]
    expect(errorMessage).toContain('RECOMMENDED PATTERN')
    expect(errorMessage).toContain('Move QuilttProvider to a parent component')
    expect(errorMessage).toContain('Example:')
    expect(errorMessage).toContain('CORRECT')
    expect(errorMessage).toContain('ANTI-PATTERN')
  })

  it('only warns once per component instance', () => {
    const Wrapper = ({ children }: PropsWithChildren) => (
      <QuilttProviderRender.Provider value={{ isRenderingProvider: true }}>
        {children}
      </QuilttProviderRender.Provider>
    )

    const { rerender } = renderHook(() => useQuilttRenderGuard('QuilttButton'), {
      wrapper: Wrapper,
    })

    expect(consoleErrorSpy).toHaveBeenCalledOnce()

    // Rerender should not trigger another warning
    rerender()
    expect(consoleErrorSpy).toHaveBeenCalledOnce()
  })
})
