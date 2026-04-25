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
    const { data } = await api.get('/jobs')
    return data.data
  },

  // GET /api/jobs/:id
  getById: async (id: string): Promise<Job> => {
    if (USE_MOCK) {
      await delay()
      const job = MOCK_JOBS.find(j => j.id === id)
      if (!job) throw new Error('Job not found')
      return job
    }
    const { data } = await api.get(`/jobs/${id}`)
    return data.data
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
    const { data } = await api.post('/jobs', payload)
    return data.data
  },

  // PUT /api/jobs/:id
  update: async (id: string, payload: Partial<CreateJobPayload>): Promise<Job> => {
    if (USE_MOCK) {
      await delay()
      const job = MOCK_JOBS.find(j => j.id === id)
      if (!job) throw new Error('Job not found')
      return { ...job, ...payload, updatedAt: new Date().toISOString() }
    }
    const { data } = await api.put(`/jobs/${id}`, payload)
    return data.data
  },

  // DELETE /api/jobs/:id
  remove: async (id: string): Promise<void> => {
    if (USE_MOCK) { await delay(); return }
    await api.delete(`/jobs/${id}`)
  },
}