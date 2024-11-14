import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { QuilttSettingsProvider } from '@/providers'

describe('QuilttSettingsProvider', async () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children correctly', async () => {
    const { getByText } = render(<QuilttSettingsProvider>Children</QuilttSettingsProvider>)
    expect(getByText('Children')).toBeTruthy()
  })
})
