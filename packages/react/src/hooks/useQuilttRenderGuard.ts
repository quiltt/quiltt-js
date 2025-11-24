'use client'

import { useContext, useEffect, useRef } from 'react'

import { QuilttProviderRender } from '@/contexts/QuilttProviderRender'

/**
 * Internal hook that checks if a Quiltt SDK component is being rendered
 * in the same component as QuilttProvider. This is an anti-pattern that
 * can cause memory context issues and unexpected behavior.
 *
 * When detected, this hook will emit a console error to help developers
 * identify and fix the issue.
 *
 * @param componentName - The name of the component calling this hook (for error messages)
 */
export const useQuilttRenderGuard = (componentName: string) => {
  const { isRenderingProvider } = useContext(QuilttProviderRender)
  const hasWarnedRef = useRef(false)

  useEffect(() => {
    // Only warn once per component instance
    if (isRenderingProvider && !hasWarnedRef.current) {
      hasWarnedRef.current = true
      console.error(
        `[Quiltt] ❌ ANTI-PATTERN DETECTED: ${componentName} is being rendered in the same component as QuilttProvider.\n\n` +
          `This can cause memory context issues and unexpected behavior because:\n` +
          `  • The Provider and SDK components run at the same React execution layer\n` +
          `  • They are not functionally wrapped at the React context level\n` +
          `  • React cannot properly manage the context hierarchy\n\n` +
          `RECOMMENDED FIX:\n` +
          `  • Move QuilttProvider to a parent component or layout\n` +
          `  • Render ${componentName} in a child component\n\n` +
          `Example:\n\n` +
          `  // ✅ CORRECT: Provider in parent component\n` +
          `  function Providers({ children }) {\n` +
          `    return (\n` +
          `      <QuilttProvider token={token}>\n` +
          `        {children}\n` +
          `      </QuilttProvider>\n` +
          `    )\n` +
          `  }\n\n` +
          `  // ✅ CORRECT: SDK component in child component\n` +
          `  function MyFeature() {\n` +
          `    return <${componentName} connectorId="..." />\n` +
          `  }\n\n` +
          `  // ❌ INCORRECT: Both in same component\n` +
          `  function MyFeature() {\n` +
          `    return (\n` +
          `      <QuilttProvider token={token}>\n` +
          `        <${componentName} connectorId="..." />\n` +
          `      </QuilttProvider>\n` +
          `    )\n` +
          `  }\n\n` +
          `Learn more: https://github.com/quiltt/quiltt-js/tree/main/packages/react#provider-usage`
      )
    }
  }, [isRenderingProvider, componentName])
}

export default useQuilttRenderGuard
