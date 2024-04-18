import { render } from '@testing-library/react'
import { QuilttAuthProvider } from '@/providers'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('QuilttAuthProvider', async () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children correctly', async () => {
    const { getByText } = render(<QuilttAuthProvider>Children</QuilttAuthProvider>)
    expect(getByText('Children')).toBeTruthy()
  })
})
