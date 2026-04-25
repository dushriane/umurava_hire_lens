import api from '@/lib/axios'

export const authApi = {
  login: async (username: string, password: string): Promise<{ token: string; user: any }> => {
    const { data } = await api.post('/auth/login', { username, password })
    if (data.data?.token) {
      localStorage.setItem('umurava_token', data.data.token)
    }
    return data.data
  },

  logout: () => {
    localStorage.removeItem('umurava_token')
  },

  getToken: () => localStorage.getItem('umurava_token'),
}