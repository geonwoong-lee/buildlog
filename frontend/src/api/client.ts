const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

type ApiErrorDetail = string | { msg?: string }

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  })
  const body = (await response.json().catch(() => ({}))) as {
    detail?: ApiErrorDetail | ApiErrorDetail[]
  }

  if (!response.ok) {
    const details = Array.isArray(body.detail) ? body.detail : [body.detail]
    const message = details
      .map((detail) => (typeof detail === 'string' ? detail : detail?.msg))
      .filter(Boolean)
      .join(', ')
    throw new Error(message || '요청을 처리하지 못했습니다.')
  }

  return body as T
}

export type User = {
  id: number
  email: string
  nickname: string
}

export function getCurrentUser() {
  return request<User>('/api/auth/me')
}

export function signup(payload: { email: string; password: string; nickname: string }) {
  return request<User>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function login(payload: { email: string; password: string }) {
  return request<User>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateNickname(nickname: string) {
  return request<User>('/api/auth/nickname', {
    method: 'PATCH',
    body: JSON.stringify({ nickname }),
  })
}
