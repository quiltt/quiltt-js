import { describe, expect, it } from 'vitest'

import { version } from '@/version'

describe('version', () => {
  it('exports a semantic version string', () => {
    expect(version).toMatch(/^\d+\.\d+\.\d+(-[\w.-]+)?$/)
  })
})
