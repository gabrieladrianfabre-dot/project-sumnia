const TOKEN_KEY = 'sumnia-token' // curator session (per tab)
const USER_KEY = 'sumnia-user' // user session { token, user } (persistent)

export const getToken = () => sessionStorage.getItem(TOKEN_KEY)
export const setToken = (t) => sessionStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY)

export const getUserSession = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
  } catch {
    return null
  }
}
export const setUserSession = (s) => localStorage.setItem(USER_KEY, JSON.stringify(s))
export const clearUserSession = () => localStorage.removeItem(USER_KEY)

// auth: 'curator' (or true) sends the curator token; 'user' prefers the
// signed-in user's token, falling back to the curator token if present.
async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {}
  if (body) headers['content-type'] = 'application/json'
  const token =
    auth === 'user'
      ? (getUserSession()?.token ?? getToken())
      : auth
        ? getToken()
        : null
  if (token) headers['authorization'] = `Bearer ${token}`
  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.error || `Request failed (${res.status})`, res.status)
  return data
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export const fetchItems = (repo) =>
  request(`/api/items${repo ? `?repo=${encodeURIComponent(repo)}` : ''}`)
export const fetchItem = (id) => request(`/api/items/${id}`)
export const fetchRepos = () => request('/api/repos')
export const createRepo = (fields) =>
  request('/api/repos', { method: 'POST', body: fields, auth: 'user' })
export const login = (password) => request('/api/login', { method: 'POST', body: { password } })
export const signup = (fields) => request('/api/signup', { method: 'POST', body: fields })
export const userLogin = (fields) =>
  request('/api/auth/login', { method: 'POST', body: fields })
export const createItem = (fields) =>
  request('/api/items', { method: 'POST', body: fields, auth: true })
export const updateItem = (id, fields) =>
  request(`/api/items/${id}`, { method: 'PUT', body: fields, auth: true })
export const deleteItem = (id) =>
  request(`/api/items/${id}`, { method: 'DELETE', auth: true })
