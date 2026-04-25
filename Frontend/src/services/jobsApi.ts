import api from '@/lib/axios'
import { Job, CreateJobPayload } from '@/types'
import { MOCK_JOBS } from '@/lib/mockData'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true' 

// Simulate realistic network delay
const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms))

export const jobsApi = {

  // GET /api/jobs
  getAll: async (): Promise<Job[]> => {
    if (USE_MOCK) { await delay(); return MOCK_JOBS }
    try {
      const { data } = await api.get('/jobs')
      console.debug('[jobsApi] GET /jobs SUCCESS:', data)
      return data.data
    } catch (error) {
      console.error('[jobsApi] GET /jobs FAILED:', error)
      throw error
    }
  },

  // GET /api/jobs/:id
  getById: async (id: string): Promise<Job> => {
    if (USE_MOCK) {
      await delay()
      const job = MOCK_JOBS.find(j => j.id === id)
      if (!job) throw new Error('Job not found')
      return job
    }
    try {
      const { data } = await api.get(`/jobs/${id}`)
      console.debug('[jobsApi] GET /jobs/:id SUCCESS:', data)
      return data.data
    } catch (error) {
      console.error('[jobsApi] GET /jobs/:id FAILED:', error)
      throw error
    }
  },

  // POST /api/jobs
  create: async (payload: CreateJobPayload): Promise<Job> => {
    if (USE_MOCK) {
      await delay(800)
      const newJob: Job = {
        ...payload,
        id: `job-${Date.now()}`,
        status: 'active',
        applicantCount: 0,
        postedDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return newJob
    }
    try {
      const { data } = await api.post('/jobs', payload)
      console.debug('[jobsApi] POST /jobs SUCCESS:', data)
      return data.data
    } catch (error) {
      console.error('[jobsApi] POST /jobs FAILED:', error)
      throw error
    }
  },

  // PUT /api/jobs/:id
  update: async (id: string, payload: Partial<CreateJobPayload>): Promise<Job> => {
    if (USE_MOCK) {
      await delay()
      const job = MOCK_JOBS.find(j => j.id === id)
      if (!job) throw new Error('Job not found')
      return { ...job, ...payload, updatedAt: new Date().toISOString() }
    }
    try {
      const { data } = await api.put(`/jobs/${id}`, payload)
      console.debug('[jobsApi] PUT /jobs/:id SUCCESS:', data)
      return data.data
    } catch (error) {
      console.error('[jobsApi] PUT /jobs/:id FAILED:', error)
      throw error
    }
  },

  // DELETE /api/jobs/:id
  remove: async (id: string): Promise<void> => {
    if (USE_MOCK) { await delay(); return }
    try {
      const { data } = await api.delete(`/jobs/${id}`)
      console.debug('[jobsApi] DELETE /jobs/:id SUCCESS:', data)
    } catch (error) {
      console.error('[jobsApi] DELETE /jobs/:id FAILED:', error)
      throw error
    }
  },
}