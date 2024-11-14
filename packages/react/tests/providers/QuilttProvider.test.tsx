import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { QuilttProvider } from '@/providers'

describe('QuilttProvider', async () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children correctly', async () => {
    const { getByText } = render(<QuilttProvider>Children</QuilttProvider>)
    expect(getByText('Children')).toBeTruthy()
  })
})
