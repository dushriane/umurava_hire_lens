import api from '@/lib/axios'
import { Applicant, UmuravaProfile } from '@/types'
import { MOCK_UMURAVA_PROFILES } from '@/lib/mockData'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true' 
const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms))

export const applicantsApi = {

  // GET /api/jobs/:jobId/applicants — Umurava profiles who applied
  getByJob: async (jobId: string): Promise<UmuravaProfile[]> => {
    if (USE_MOCK) { await delay(); return MOCK_UMURAVA_PROFILES }
    try {
      const { data } = await api.get(`/applicants/${jobId}`)
      console.debug('[applicantsApi] GET /applicants/:jobId SUCCESS:', data)
      return data.data
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
      const { data } = await api.post(
        `/applicants/${jobId}/upload-csv`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      console.debug('[applicantsApi] POST /applicants/:jobId/upload-csv SUCCESS:', data)
      return data.data
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
      const formData = new FormData()
      Array.from(files).forEach(f => formData.append('resumes', f))
      const { data } = await api.post(
        `/applicants/${jobId}/upload-resumes`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      console.debug('[applicantsApi] POST /applicants/:jobId/upload-resumes SUCCESS:', data)
      return data.data
    } catch (error) {
      console.error('[applicantsApi] POST /applicants/:jobId/upload-resumes FAILED:', error)
      throw error
    }
  },
}