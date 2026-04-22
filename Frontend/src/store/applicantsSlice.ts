import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ApplicantsState, Applicant } from '@/types'
import { applicantsApi } from '@/services/applicantsApi'

// ------------------------------------------------------------
// ASYNC THUNKS
// ------------------------------------------------------------

export const fetchApplicantsByJob = createAsyncThunk(
  'applicants/fetchByJob',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const applicants = await applicantsApi.getByJob(jobId)
      return { jobId, applicants }
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

export const uploadCsvApplicants = createAsyncThunk(
  'applicants/uploadCsv',
  async ({ jobId, file }: { jobId: string; file: File }, { rejectWithValue }) => {
    try {
      const applicants = await applicantsApi.uploadCsv(jobId, file)
      return { jobId, applicants }
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

export const uploadResumeApplicants = createAsyncThunk(
  'applicants/uploadResumes',
  async ({ jobId, files }: { jobId: string; files: FileList }, { rejectWithValue }) => {
    try {
      const applicants = await applicantsApi.uploadResumes(jobId, files)
      return { jobId, applicants }
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// ------------------------------------------------------------
// INITIAL STATE
// ------------------------------------------------------------

const initialState: ApplicantsState = {
  byJobId: {},
  selected: [],
  uploadStatus: 'idle',
  parseStatus: 'idle',
  error: null,
}

// ------------------------------------------------------------
// SLICE
// ------------------------------------------------------------

const applicantsSlice = createSlice({
  name: 'applicants',
  initialState,
  reducers: {
    // Toggle one applicant's selection for screening
    toggleApplicantSelection(state, action: PayloadAction<string>) {
      const id = action.payload
      if (state.selected.includes(id)) {
        state.selected = state.selected.filter(s => s !== id)
      } else {
        state.selected.push(id)
      }
    },

    // Select all applicants for a job
    selectAllApplicants(state, action: PayloadAction<string[]>) {
      state.selected = action.payload
    },

    // Clear all selections
    clearSelection(state) {
      state.selected = []
    },

    // Reset upload status
    resetUploadStatus(state) {
      state.uploadStatus = 'idle'
      state.parseStatus = 'idle'
      state.error = null
    },

    clearError(state) {
      state.error = null
    },
  },

  extraReducers: (builder) => {

    // fetchApplicantsByJob
    builder
      .addCase(fetchApplicantsByJob.pending, (state) => {
        state.uploadStatus = 'uploading'
        state.error = null
      })
      .addCase(fetchApplicantsByJob.fulfilled, (state, action) => {
        state.uploadStatus = 'succeeded'
        const { jobId, applicants } = action.payload
        state.byJobId[jobId] = applicants
        // Auto-select all fetched applicants
        state.selected = applicants.map(a => a.id)
      })
      .addCase(fetchApplicantsByJob.rejected, (state, action) => {
        state.uploadStatus = 'failed'
        state.error = action.payload as string
      })

    // uploadCsvApplicants
    builder
      .addCase(uploadCsvApplicants.pending, (state) => {
        state.uploadStatus = 'uploading'
        state.error = null
      })
      .addCase(uploadCsvApplicants.fulfilled, (state, action) => {
        state.uploadStatus = 'succeeded'
        const { jobId, applicants } = action.payload
        // Merge with existing applicants for this job
        const existing = state.byJobId[jobId] ?? []
        const existingIds = new Set(existing.map(a => a.id))
        const newOnes = applicants.filter(a => !existingIds.has(a.id))
        state.byJobId[jobId] = [...existing, ...newOnes]
        // Auto-select newly uploaded
        newOnes.forEach(a => { if (!state.selected.includes(a.id)) state.selected.push(a.id) })
      })
      .addCase(uploadCsvApplicants.rejected, (state, action) => {
        state.uploadStatus = 'failed'
        state.error = action.payload as string
      })

    // uploadResumeApplicants
    builder
      .addCase(uploadResumeApplicants.pending, (state) => {
        state.parseStatus = 'parsing'
        state.error = null
      })
      .addCase(uploadResumeApplicants.fulfilled, (state, action) => {
        state.parseStatus = 'succeeded'
        const { jobId, applicants } = action.payload
        const existing = state.byJobId[jobId] ?? []
        state.byJobId[jobId] = [...existing, ...applicants]
        applicants.forEach(a => { if (!state.selected.includes(a.id)) state.selected.push(a.id) })
      })
      .addCase(uploadResumeApplicants.rejected, (state, action) => {
        state.parseStatus = 'failed'
        state.error = action.payload as string
      })
  },
})

// ------------------------------------------------------------
// EXPORTS
// ------------------------------------------------------------

export const {
  toggleApplicantSelection,
  selectAllApplicants,
  clearSelection,
  resetUploadStatus,
  clearError,
} = applicantsSlice.actions

// Selectors
export const selectApplicantsByJob = (jobId: string) =>
  (state: { applicants: ApplicantsState }): Applicant[] =>
    state.applicants.byJobId[jobId] ?? []

export const selectSelectedIds     = (state: { applicants: ApplicantsState }) => state.applicants.selected
export const selectUploadStatus    = (state: { applicants: ApplicantsState }) => state.applicants.uploadStatus
export const selectParseStatus     = (state: { applicants: ApplicantsState }) => state.applicants.parseStatus
export const selectApplicantsError = (state: { applicants: ApplicantsState }) => state.applicants.error

export default applicantsSlice.reducer