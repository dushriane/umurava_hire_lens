import axios from 'axios'

// ------------------------------------------------------------
// Base axios instance
// When backend is ready, set NEXT_PUBLIC_API_URL in .env.local
// e.g. NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
// ------------------------------------------------------------

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000,  // 30s — AI screening takes time
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach auth token if present
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('umurava_token')
    : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export default api