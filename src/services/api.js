const API_BASE = import.meta.env.VITE_API_BASE || '/api'

const getAuthToken = () => typeof window !== 'undefined' ? window.localStorage.getItem('authToken') : null

const request = async (path, options = {}) => {
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.error || res.statusText)
  }
  return res.status === 204 ? null : res.json()
}

export const login = (email, password) => request('/auth/login', { method: 'POST', body: { email, password } })
export const register = (name, email, password) => request('/auth/register', { method: 'POST', body: { name, email, password } })
export const fetchCurrentUser = () => request('/auth/me')

export const fetchProperties = () => request('/properties')
export const fetchProperty = (id) => request(`/properties/${id}`)
export const fetchPropertyTenants = (id) => request(`/properties/${id}/tenants`)
export const createProperty = (property) => request('/properties', { method: 'POST', body: property })
export const updateProperty = (id, property) => request(`/properties/${id}`, { method: 'PUT', body: property })
export const deleteProperty = (id) => request(`/properties/${id}`, { method: 'DELETE' })

export const fetchTenants = () => request('/tenants')
export const fetchTenant = (id) => request(`/tenants/${id}`)
export const createTenant = (tenant) => request('/tenants', { method: 'POST', body: tenant })
export const updateTenant = (id, tenant) => request(`/tenants/${id}`, { method: 'PUT', body: tenant })
export const deleteTenant = (id) => request(`/tenants/${id}`, { method: 'DELETE' })

export const fetchPayments = () => request('/payments')
export const fetchPayment = (id) => request(`/payments/${id}`)
export const createPayment = (payment) => request('/payments', { method: 'POST', body: payment })
export const updatePayment = (id, payment) => request(`/payments/${id}`, { method: 'PUT', body: payment })
export const deletePayment = (id) => request(`/payments/${id}`, { method: 'DELETE' })
