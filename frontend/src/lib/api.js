const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3504/api'

export const session = {
  get token() { return localStorage.getItem('remotiva_token') },
  set token(value) { value ? localStorage.setItem('remotiva_token', value) : localStorage.removeItem('remotiva_token') },
  get user() { try { return JSON.parse(localStorage.getItem('remotiva_user') || 'null') } catch { return null } },
  set user(value) { value ? localStorage.setItem('remotiva_user', JSON.stringify(value)) : localStorage.removeItem('remotiva_user') }
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (session.token) headers.Authorization = `Bearer ${session.token}`

  const response = await fetch(`${baseUrl}${path}`, { ...options, headers })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) throw new Error(payload.message || 'Request failed')
  return payload
}

export const api = {
  login: data => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: data => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/me'),
  categories: () => request('/categories'),
  services: params => {
    const query = new URLSearchParams(params || {}).toString()
    return request(`/services${query ? `?${query}` : ''}`)
  },
  service: id => request(`/services/${id}`),
  saved: () => request('/saved'),
  save: id => request(`/saved/${id}`, { method: 'POST' }),
  unsave: id => request(`/saved/${id}`, { method: 'DELETE' }),
  orders: () => request('/orders'),
  createOrder: data => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  inbox: () => request('/messages'),
  profile: () => request('/profile'),
  updatePreferences: data => request('/profile/preferences', { method: 'PATCH', body: JSON.stringify(data) }),
  updateInterests: data => request('/profile/interests', { method: 'PATCH', body: JSON.stringify(data) })
}