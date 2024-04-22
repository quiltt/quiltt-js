import { beforeEach, describe, expect, it, vi } from 'vitest'
import { version } from '@/version'
import { version as packageVersion } from '../package.json'

describe('Version', async () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return the correct version', async () => {
    expect(version).toBe(packageVersion)
  })
})
