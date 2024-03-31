import { render } from '@testing-library/react'
import { QuilttProvider } from '@/providers'
import { describe, expect, it, vi } from 'vitest'

describe('QuilttProvider', async () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children correctly', async () => {
    const { getByText } = render(<QuilttProvider>Children</QuilttProvider>)
    expect(getByText('Children')).toBeTruthy()
  })
})
