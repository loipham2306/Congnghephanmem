const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.message || `Lỗi HTTP: ${res.status}`)
    }

    return await res.json()
  } catch (error) {
    console.warn(`[API] ${endpoint} fetch error:`, error.message)
    throw error
  }
}

export default {
  get: (url, headers) => request(url, { method: 'GET', headers }),
  post: (url, body, headers) => request(url, { method: 'POST', body: JSON.stringify(body), headers }),
  put: (url, body, headers) => request(url, { method: 'PUT', body: JSON.stringify(body), headers }),
  delete: (url, headers) => request(url, { method: 'DELETE', headers })
}
