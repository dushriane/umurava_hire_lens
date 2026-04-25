import api from '@/lib/axios'

/**
 * Decode JWT token to extract expiration time
 */
function decodeToken(token: string): { exp?: number; [key: string]: any } {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return {}
    
    const decoded = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    )
    return decoded
  } catch {
    return {}
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string | null): boolean {
  if (!token) return true
  
  const decoded = decodeToken(token)
  if (!decoded.exp) return true
  
  // Check if expiration time is in the past (with 1 minute buffer)
  const now = Math.floor(Date.now() / 1000)
  return decoded.exp <= now + 60
}

export const authApi = {
  login: async (username: string, password: string): Promise<{ token: string; user: any }> => {
    const { data } = await api.post('/auth/login', { username, password })
    if (data?.token) {
      localStorage.setItem('umurava_token', data.token)
    }
    return data
  },

  logout: () => {
    localStorage.removeItem('umurava_token')
  },

  getToken: () => localStorage.getItem('umurava_token'),

  /**
   * Check if current token is valid
   */
  isTokenValid: (): boolean => {
    const token = localStorage.getItem('umurava_token')
    if (!token) return false
    return !isTokenExpired(token)
  },

  /**
   * Get time until token expires in seconds (-1 if expired)
   */
  getTokenExpiresIn: (): number => {
    const token = localStorage.getItem('umurava_token')
    if (!token) return -1
    
    const decoded = decodeToken(token)
    if (!decoded.exp) return -1
    
    const now = Math.floor(Date.now() / 1000)
    return Math.max(decoded.exp - now, -1)
  },
}