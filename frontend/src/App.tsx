import { useEffect, useState } from 'react'
import './App.css'

type ApiState = 'checking' | 'connected' | 'unavailable'

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

function App() {
  const [apiState, setApiState] = useState<ApiState>('checking')

  useEffect(() => {
    const controller = new AbortController()

    async function checkApi() {
      try {
        const response = await fetch(`${apiBaseUrl}/health`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('API health check failed')
        }

        const data = (await response.json()) as { status?: string }
        setApiState(data.status === 'ok' ? 'connected' : 'unavailable')
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setApiState('unavailable')
        }
      }
    }

    void checkApi()

    return () => controller.abort()
  }, [])

  const statusText = {
    checking: '서버 연결을 확인하고 있습니다.',
    connected: 'FastAPI 서버와 연결되었습니다.',
    unavailable: 'FastAPI 서버에 연결할 수 없습니다.',
  }[apiState]

  return (
    <main className="app-shell">
      <section className="status-card" aria-labelledby="page-title">
        <p className="eyebrow">BUILDLOG</p>
        <h1 id="page-title">공부와 문제 해결 과정을 한곳에 기록하세요.</h1>
        <p className="description">
          React 화면과 FastAPI 서버의 기본 연결을 확인하는 Phase 1 화면입니다.
        </p>
        <p className={`api-status api-status--${apiState}`} role="status">
          <span aria-hidden="true" />
          {statusText}
        </p>
      </section>
    </main>
  )
}

export default App
