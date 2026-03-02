'use client'

import { useContext, useEffect, useRef } from 'react'

import { QuilttProviderRender } from '@/contexts/QuilttProviderRender'

/**
 * Internal hook that detects when a Quiltt SDK component may be rendered
 * in the same component as QuilttProvider, which is an anti-pattern that
 * can cause memory context issues and unexpected behavior.
 *
 * **Limitation**: Due to React context propagation, this will trigger for ALL
 * descendants of QuilttProvider, not just direct children. This means it may
 * produce false positives for valid nested component patterns. However, the
 * primary use case (same-component rendering) is reliably detected.
 *
 * When the flag is set, this hook will emit a console error. This primarily
 * helps catch the anti-pattern but may also flag valid nested structures.
 *
 * @param componentName - The name of the component calling this hook (for error messages)
 */
export const useQuilttRenderGuard = (componentName: string) => {
  const { isRenderingProvider } = useContext(QuilttProviderRender)
  const hasWarnedRef = useRef(false)

  useEffect(() => {
    // Only run in development mode and warn once per component instance
    const isProduction = process.env.NODE_ENV === 'production'

    if (isProduction) return

    if (isRenderingProvider && !hasWarnedRef.current) {
      hasWarnedRef.current = true
      console.error(
        `[Quiltt] ⚠️  POTENTIAL ANTI-PATTERN: ${componentName} may be rendered in the same component as QuilttProvider.\n\n` +
          `NOTE: This check uses a simple flag and may produce false positives for valid nested patterns.\n` +
          `If ${componentName} is in a SEPARATE component from QuilttProvider, you can safely ignore this.\n\n` +
          `The ANTI-PATTERN we're trying to catch:\n` +
          `  • Rendering Provider and SDK components in the SAME function component\n` +
          `  • This causes memory context issues because they run at the same React execution layer\n` +
          `  • React cannot properly manage the context hierarchy in this case\n\n` +
          `RECOMMENDED PATTERN:\n` +
          `  • Move QuilttProvider to a parent component or layout\n` +
          `  • Render ${componentName} in a child component\n\n` +
          `Example:\n\n` +
          `  // ✅ CORRECT: Provider in parent, SDK component in child (separate components)\n` +
          `  function Providers({ children }) {\n` +
          `    return (\n` +
          `      <QuilttProvider token={token}>\n` +
          `        {children}\n` +
          `      </QuilttProvider>\n` +
          `    )\n` +
          `  }\n\n` +
          `  function MyFeature() {\n` +
          `    return <${componentName} connectorId="..." />\n` +
          `  }\n\n` +
          `  // ❌ ANTI-PATTERN: Both in SAME component\n` +
          `  function MyFeature() {\n` +
          `    return (\n` +
          `      <QuilttProvider token={token}>\n` +
          `        <${componentName} connectorId="..." />\n` +
          `      </QuilttProvider>\n` +
          `    )\n` +
          `  }\n\n` +
          `Learn more:\n` +
          `  • https://github.com/quiltt/quiltt-js/tree/main/packages/react#provider-usage\n` +
          `  • https://react.dev/reference/react/useContext#my-component-doesnt-see-the-value-from-my-provider`
      )
    }
  }, [isRenderingProvider, componentName])
}
