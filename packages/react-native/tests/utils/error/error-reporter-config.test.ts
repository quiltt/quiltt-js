import { describe, expect, it } from 'vitest'

import { ErrorReporterConfig } from '@/utils/error/ErrorReporterConfig'

describe('ErrorReporterConfig', () => {
  it('exports the expected default config shape', () => {
    expect(ErrorReporterConfig).toEqual({
      honeybadger_api_key: 'undefined',
    })
  })
})
