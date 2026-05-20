import { describe, expect, it } from 'vitest'

import * as ComponentsIndex from '@/components/index'
import { QuilttButton } from '@/components/QuilttButton'
import { QuilttContainer } from '@/components/QuilttContainer'

const hasEmit = (component: { emits?: unknown }, eventName: string) => {
  if (!component.emits) return false

  if (Array.isArray(component.emits)) {
    return component.emits.includes(eventName)
  }

  if (typeof component.emits === 'object') {
    return Object.hasOwn(component.emits, eventName)
  }

  return false
}

const callEmitValidator = (
  component: { emits?: unknown },
  eventName: string,
  ...args: unknown[]
) => {
  if (!component.emits || Array.isArray(component.emits) || typeof component.emits !== 'object') {
    return false
  }

  const candidate = (component.emits as Record<string, unknown>)[eventName]
  if (typeof candidate !== 'function') {
    return false
  }

  return (candidate as (...input: unknown[]) => boolean)(...args)
}

describe('components modules', () => {
  it('exports all components from components index', () => {
    expect(ComponentsIndex.QuilttButton).toBe(QuilttButton)
    expect(ComponentsIndex.QuilttContainer).toBe(QuilttContainer)
  })

  it('defines button component contract', () => {
    expect(QuilttButton.name).toBe('QuilttButton')
    expect(QuilttButton.props?.connectorId).toBeDefined()
    expect(hasEmit(QuilttButton, 'exit-success')).toBe(true)
    expect(hasEmit(QuilttButton, 'exit')).toBe(true)
  })

  it('defines container component contract', () => {
    expect(QuilttContainer.name).toBe('QuilttContainer')
    expect(QuilttContainer.props?.connectorId).toBeDefined()
    expect(hasEmit(QuilttContainer, 'exit-success')).toBe(true)
    expect(hasEmit(QuilttContainer, 'event')).toBe(true)
  })

  it('validates container emit payload signatures', () => {
    expect(callEmitValidator(QuilttButton, 'load', {})).toBe(true)
    expect(callEmitValidator(QuilttButton, 'open', {})).toBe(true)
    expect(callEmitValidator(QuilttButton, 'exit-success', {})).toBe(true)
    expect(callEmitValidator(QuilttButton, 'exit-abort', {})).toBe(true)
    expect(callEmitValidator(QuilttButton, 'exit-error', {})).toBe(true)
    expect(callEmitValidator(QuilttButton, 'exit', 'ExitSuccess', {})).toBe(true)
    expect(callEmitValidator(QuilttButton, 'event', 'Load', {})).toBe(true)
  })

  it('validates button and container emit payload signatures', () => {
    expect(callEmitValidator(QuilttContainer, 'load', {})).toBe(true)
    expect(callEmitValidator(QuilttContainer, 'exit-success', {})).toBe(true)
    expect(callEmitValidator(QuilttContainer, 'exit-abort', {})).toBe(true)
    expect(callEmitValidator(QuilttContainer, 'exit-error', {})).toBe(true)
    expect(callEmitValidator(QuilttContainer, 'exit', 'ExitSuccess', {})).toBe(true)
    expect(callEmitValidator(QuilttContainer, 'event', 'Load', {})).toBe(true)
  })
})
