import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows a successful API connection', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'ok', service: 'buildlog-api' }),
      }),
    )

    render(<App />)

    expect(
      await screen.findByText('FastAPI 서버와 연결되었습니다.'),
    ).toBeInTheDocument()
  })
})
