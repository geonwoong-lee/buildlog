import { useEffect, useState, type FormEvent } from 'react'
import './App.css'
import { getCurrentUser, login, signup, updateNickname, type User } from './api/client'

type ApiState = 'checking' | 'connected' | 'unavailable'
type AuthMode = 'login' | 'signup'

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

function App() {
  const [apiState, setApiState] = useState<ApiState>('checking')
  const [user, setUser] = useState<User | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [authMessage, setAuthMessage] = useState('')
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadSession() {
      try {
        const response = await fetch(`${apiBaseUrl}/health`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('health check failed')
        const data = (await response.json()) as { status?: string }
        setApiState(data.status === 'ok' ? 'connected' : 'unavailable')
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setApiState('unavailable')
      }

      try {
        setUser(await getCurrentUser())
      } catch {
        setUser(null)
      }
    }

    void loadSession()
    return () => controller.abort()
  }, [])

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthMessage('')
    setAuthError('')
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')

    try {
      if (authMode === 'signup') {
        await signup({
          email,
          password,
          nickname: String(form.get('nickname') ?? ''),
        })
        formElement.reset()
        setAuthMode('login')
        setAuthMessage('회원가입이 완료되었습니다. 로그인해 주세요.')
      } else {
        setUser(await login({ email, password }))
        formElement.reset()
        setAuthMessage('로그인되었습니다.')
      }
    } catch (error) {
      setAuthError((error as Error).message)
    }
  }

  async function handleNickname(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthMessage('')
    setAuthError('')
    const form = new FormData(event.currentTarget)
    try {
      setUser(await updateNickname(String(form.get('nickname') ?? '')))
      setAuthMessage('닉네임을 변경했습니다.')
    } catch (error) {
      setAuthError((error as Error).message)
    }
  }

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
        <p className="description">공부한 내용과 앞으로 할 일을 잊지 않도록 기록하는 공간입니다.</p>
        <p className={`api-status api-status--${apiState}`} role="status">
          <span aria-hidden="true" />
          {statusText}
        </p>

        {user ? (
          <section className="auth-panel" aria-labelledby="account-title">
            <h2 id="account-title">안녕하세요, {user.nickname}님</h2>
            <p className="muted">{user.email}</p>
            <form onSubmit={handleNickname} className="form-stack">
              <label htmlFor="new-nickname">닉네임 변경</label>
              <input id="new-nickname" name="nickname" placeholder="새 닉네임" />
              <button type="submit">변경하기</button>
            </form>
          </section>
        ) : (
          <section className="auth-panel" aria-labelledby="auth-title">
            <div className="mode-switch" role="tablist" aria-label="계정 메뉴">
              <button className={authMode === 'login' ? 'active' : ''} type="button" role="tab" aria-selected={authMode === 'login'} onClick={() => { setAuthMode('login'); setAuthError('') }}>
                로그인
              </button>
              <button className={authMode === 'signup' ? 'active' : ''} type="button" role="tab" aria-selected={authMode === 'signup'} onClick={() => { setAuthMode('signup'); setAuthError('') }}>
                회원가입
              </button>
            </div>
            <h2 id="auth-title">{authMode === 'login' ? '다시 만나서 반가워요' : 'BuildLog 시작하기'}</h2>
            <form onSubmit={handleAuth} className="form-stack">
              <label htmlFor="email">이메일</label>
              <input id="email" name="email" type="email" autoComplete="email" required />
              <label htmlFor="password">비밀번호</label>
              <input id="password" name="password" type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} minLength={8} maxLength={64} required />
              {authMode === 'signup' && (
                <>
                  <label htmlFor="nickname">닉네임</label>
                  <input id="nickname" name="nickname" minLength={2} maxLength={20} required />
                </>
              )}
              <button type="submit">{authMode === 'login' ? '로그인' : '회원가입'}</button>
            </form>
          </section>
        )}

        {authMessage && <p className="form-message success">{authMessage}</p>}
        {authError && <p className="form-message error" role="alert">{authError}</p>}
      </section>
    </main>
  )
}

export default App
