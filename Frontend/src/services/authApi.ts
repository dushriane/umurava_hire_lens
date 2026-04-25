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
    try {
      console.debug('[authApi] Attempting login:', { username })
      const { data } = await api.post('/auth/login', { username, password })
      console.debug('[authApi] Login SUCCESS:', data)
      if (data?.data?.token) {
        localStorage.setItem('umurava_token', data.data.token)
        console.debug('[authApi] Token saved to localStorage')
      }
      return data.data
    } catch (error) {
      console.error('[authApi] Login FAILED:', error)
      throw error
    }
  },

  logout: () => {
    console.debug('[authApi] Logout')
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