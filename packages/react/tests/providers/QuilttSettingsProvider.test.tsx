import { render } from '@testing-library/react'
import { QuilttSettingsProvider } from '@/providers'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('QuilttSettingsProvider', async () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children correctly', async () => {
    const { getByText } = render(<QuilttSettingsProvider>Children</QuilttSettingsProvider>)
    expect(getByText('Children')).toBeTruthy()
  })
})
