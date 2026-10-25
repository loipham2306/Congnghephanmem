const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function getToken() {
  return localStorage.getItem('clinic_token') || localStorage.getItem('token') || localStorage.getItem('accessToken')
}

export function buildQuery(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val)
    }
  })
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

export async function request(endpoint, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`

  try {
    const res = await fetch(url, {
      ...options,
      headers
    })

    if (res.status === 401) {
      console.warn(`[API] 401 Unauthorized tai ${endpoint}`)
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      const error = new Error(errData.message || `Lỗi máy chủ (${res.status})`)
      error.status = res.status
      error.data = errData
      throw error
    }

    return await res.json()
  } catch (error) {
    console.warn(`[API] ${endpoint} fetch error:`, error.message)
    throw error
  }
}

export const api = {
  get: (url, params, headers) => {
    const fullUrl = params ? `${url}${buildQuery(params)}` : url
    return request(fullUrl, { method: 'GET', headers })
  },
  post: (url, body, headers) => request(url, { method: 'POST', body: JSON.stringify(body), headers }),
  put: (url, body, headers) => request(url, { method: 'PUT', body: JSON.stringify(body), headers }),
  patch: (url, body, headers) => request(url, { method: 'PATCH', body: JSON.stringify(body), headers }),
  delete: (url, headers) => request(url, { method: 'DELETE', headers })
}

export default api
