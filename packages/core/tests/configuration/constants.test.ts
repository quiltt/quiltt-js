import { describe, it, expect, vi } from 'vitest'
import { cdnBase, debugging, version } from '@/configuration'
import { name as packageName, version as packageVersion } from '../../package.json'

describe('Configuration Constants', async () => {
  it('should default to the correct domain if not provided', () => {
    expect(cdnBase).toContain('quiltt.io')
  })

  it('should format the version correctly', () => {
    expect(version).toBe(`${packageName}: v${packageVersion}`)
  })

  it('should reflect the correct debugging status based on environment', () => {
    vi.stubGlobal('process', {
      env: {
        NODE_ENV: 'development',
      },
    })
    expect(debugging).toBeTruthy() // Assuming the logic toggles based on NODE_ENV or similar
  })
})
