'use client'

import { useEffect, useLayoutEffect } from 'react'

/**
 * This hook is a browser hook. But React code could be generated from the server without the Window API.
 * This hook switches between useEffect and useLayoutEffect following the execution environment.
 */
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export default useIsomorphicLayoutEffect
