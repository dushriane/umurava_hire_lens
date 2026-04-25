import api from '@/lib/axios'
import { Applicant, UmuravaProfile } from '@/types'
import { MOCK_UMURAVA_PROFILES } from '@/lib/mockData'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true' 
const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms))

const mapApplicant = (data: any): Applicant => {
  return {
    ...data,
    id: data.id || data._id,
    fullName: data.fullName || data.name || 'Unknown Candidate',
    source: (data.source === 'csv' || data.source === 'pdf') ? 'external' : data.source || 'external',
  }
}

export const applicantsApi = {

  // GET /api/jobs/:jobId/applicants — Umurava profiles who applied
  getByJob: async (jobId: string): Promise<UmuravaProfile[]> => {
    if (USE_MOCK) { await delay(); return MOCK_UMURAVA_PROFILES }
    try {
      const { data } = await api.get(`/applicants/${jobId}`)
      console.debug('[applicantsApi] GET /applicants/:jobId SUCCESS:', data)
      const apps = data.data || [];
      return apps.map(mapApplicant) as UmuravaProfile[];
    } catch (error) {
      console.error('[applicantsApi] GET /applicants/:jobId FAILED:', error)
      throw error
    }
  },

  // POST /api/jobs/:jobId/applicants/upload-csv
  // Uploads a CSV/Excel file, backend parses and returns applicants
  uploadCsv: async (jobId: string, file: File): Promise<Applicant[]> => {
    if (USE_MOCK) {
      await delay(1200)
      // Return mock external applicants
      return [
        {
          id: 'ext-001', fullName: 'Chidi Okonkwo', email: 'chidi@email.com',
          location: 'Lagos, Nigeria', yearsOfExperience: 6,
          skills: ['Python', 'Keras', 'SQL', 'Tableau'], source: 'external',
        },
        {
          id: 'ext-002', fullName: 'Nadia Benali', email: 'nadia@email.com',
          location: 'Casablanca, Morocco', yearsOfExperience: 4,
          skills: ['Python', 'NLP', 'Spacy', 'Transformers'], source: 'external',
        },
      ]
    }
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('jobId', jobId)
      const { data } = await api.post(`/applicants/upload`, formData)
      console.debug('[applicantsApi] POST /applicants/upload SUCCESS:', data)
      const apps = data.applicants || (data.applicant ? [data.applicant] : [])
      return apps.map(mapApplicant)
    } catch (error) {
      console.error('[applicantsApi] POST /applicants/:jobId/upload-csv FAILED:', error)
      throw error
    }
  },

  // POST /api/jobs/:jobId/applicants/upload-resumes
  // Upload multiple PDF resumes, AI parses each one
  uploadResumes: async (jobId: string, files: FileList): Promise<Applicant[]> => {
    if (USE_MOCK) { await delay(1500); return [] }
    try {
      const applicants = await Promise.all(
        Array.from(files).map(async (f) => {
          const formData = new FormData()
          formData.append('file', f)
          formData.append('jobId', jobId)
          const { data } = await api.post(`/applicants/upload`, formData)
          return data.applicant ? mapApplicant(data.applicant) : null
        })
      )
      console.debug('[applicantsApi] POST /applicants/upload SUCCESS:', applicants)
      return applicants.filter(Boolean) as Applicant[]
    } catch (error) {
      console.error('[applicantsApi] POST /applicants/:jobId/upload-resumes FAILED:', error)
      throw error
    }
  },
}