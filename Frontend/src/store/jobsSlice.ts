import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { JobsState, Job, CreateJobPayload } from '@/types'
import { jobsApi } from '@/services/jobsApi'

// ------------------------------------------------------------
// ASYNC THUNKS — these call the API service layer
// ------------------------------------------------------------

export const fetchJobs = createAsyncThunk(
  'jobs/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await jobsApi.getAll()
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchJobById = createAsyncThunk(
  'jobs/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await jobsApi.getById(id)
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

export const createJob = createAsyncThunk(
  'jobs/create',
  async (payload: CreateJobPayload, { rejectWithValue }) => {
    try {
      return await jobsApi.create(payload)
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

export const updateJob = createAsyncThunk(
  'jobs/update',
  async ({ id, payload }: { id: string; payload: Partial<CreateJobPayload> }, { rejectWithValue }) => {
    try {
      return await jobsApi.update(id, payload)
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

export const deleteJob = createAsyncThunk(
  'jobs/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await jobsApi.remove(id)
      return id  // return id so we can remove it from state
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// ------------------------------------------------------------
// INITIAL STATE
// ------------------------------------------------------------

const initialState: JobsState = {
  list: [],
  selectedJob: null,
  status: 'idle',
  error: null,
  formDraft: {},
}

// ------------------------------------------------------------
// SLICE
// ------------------------------------------------------------

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    // Select a job (e.g. clicking a job card)
    selectJob(state, action: PayloadAction<Job | null>) {
      state.selectedJob = action.payload
    },

    // Save form progress without submitting
    updateFormDraft(state, action: PayloadAction<Partial<CreateJobPayload>>) {
      state.formDraft = { ...state.formDraft, ...action.payload }
    },

    // Clear form draft after successful create
    clearFormDraft(state) {
      state.formDraft = {}
    },

    // Clear error
    clearError(state) {
      state.error = null
    },
  },

  extraReducers: (builder) => {

    // fetchJobs
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })

    // fetchJobById
    builder
      .addCase(fetchJobById.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selectedJob = action.payload
        // also update it in the list if present
        const idx = state.list.findIndex(j => j.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })

    // createJob
    builder
      .addCase(createJob.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.list.unshift(action.payload)  // add to top of list
        state.formDraft = {}
      })
      .addCase(createJob.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })

    // updateJob
    builder
      .addCase(updateJob.fulfilled, (state, action) => {
        const idx = state.list.findIndex(j => j.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
        if (state.selectedJob?.id === action.payload.id) {
          state.selectedJob = action.payload
        }
      })

    // deleteJob
    builder
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.list = state.list.filter(j => j.id !== action.payload)
        if (state.selectedJob?.id === action.payload) {
          state.selectedJob = null
        }
      })
  },
})

// ------------------------------------------------------------
// EXPORTS
// ------------------------------------------------------------

export const { selectJob, updateFormDraft, clearFormDraft, clearError } = jobsSlice.actions

// Selectors
export const selectAllJobs       = (state: { jobs: JobsState }) => state.jobs.list
export const selectSelectedJob   = (state: { jobs: JobsState }) => state.jobs.selectedJob
export const selectJobsStatus    = (state: { jobs: JobsState }) => state.jobs.status
export const selectJobsError     = (state: { jobs: JobsState }) => state.jobs.error
export const selectFormDraft     = (state: { jobs: JobsState }) => state.jobs.formDraft
export const selectJobById = (id: string) => (state: { jobs: JobsState }) =>
  state.jobs.list.find(j => j.id === id) ?? null

export default jobsSlice.reducer