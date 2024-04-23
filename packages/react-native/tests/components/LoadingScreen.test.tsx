import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoadingScreen } from '@/components/LoadingScreen'
import { render } from '@testing-library/react-native'

describe('LoadingScreen', async () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render', async () => {
    const { getByTestId } = render(<LoadingScreen testId="loading-screen" />)
    expect(getByTestId('loading-screen')).toBeTruthy()

    const activityIndicator = getByTestId('activity-indicator')
    expect(activityIndicator).toBeTruthy()
    expect(activityIndicator.props.size).toBe('large')
    expect(activityIndicator.props.color).toBe('#5928A3')
  })
})
