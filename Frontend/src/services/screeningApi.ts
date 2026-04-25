import api from '@/lib/axios'
import { ScreeningSettings, ScreeningResult } from '@/types'
import { MOCK_SCREENING_RESULT } from '@/lib/mockData'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true' 
const delay = (ms = 2500) => new Promise(resolve => setTimeout(resolve, ms))

export const screeningApi = {

  // POST /api/screening/run
  // Sends job + applicant IDs + weights to backend
  // Backend calls Gemini API and returns ranked shortlist
  run: async (settings: ScreeningSettings): Promise<ScreeningResult> => {
    if (USE_MOCK) {
      // Simulate AI taking 2.5 seconds
      await delay()
      return {
        ...MOCK_SCREENING_RESULT,
        jobId: settings.jobId,
        settings,
        screenedAt: new Date().toISOString(),
        totalScreened: settings.applicantIds.length,
      }
    }
    try {
      const apiKey = process.env.NEXT_PUBLIC_API_KEY
      console.debug('[screeningApi] POST /screening/:jobId/screen START:', { jobId: settings.jobId })
      const { data } = await api.post(`/screening/${settings.jobId}/screen`, settings, {
        headers: {
          'X-API-Key': apiKey
        }
      })
      console.debug('[screeningApi] POST /screening/:jobId/screen SUCCESS:', data)
      return data.data
    } catch (error) {
      console.error('[screeningApi] POST /screening/:jobId/screen FAILED:', error)
      throw error
    }
  },

  // GET /api/screening/results/:jobId
  // Fetch previously saved results for a job
  getResults: async (jobId: string): Promise<ScreeningResult | null> => {
    if (USE_MOCK) {
      await delay(400)
      if (jobId === 'job-001') return MOCK_SCREENING_RESULT
      return null
    }
    try {
      console.debug('[screeningApi] GET /screening/results/:jobId START:', { jobId })
      const { data } = await api.get(`/screening/results/${jobId}`, {
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
        }
      })
      console.debug('[screeningApi] GET /screening/results/:jobId SUCCESS:', data)
      return data.data
    } catch (error) {
      console.error('[screeningApi] GET /screening/results/:jobId FAILED:', error)
      return null
    }
  },
    }
  
