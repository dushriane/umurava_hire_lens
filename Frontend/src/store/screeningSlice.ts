import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ScreeningState, ScreeningSettings, ScreeningResult } from '@/types'
import { screeningApi } from '@/services/screeningApi'

// ------------------------------------------------------------
// ASYNC THUNKS
// ------------------------------------------------------------

// Main action: trigger Gemini AI screening
export const runScreening = createAsyncThunk(
  'screening/run',
  async (settings: ScreeningSettings, { rejectWithValue }) => {
    try {
      return await screeningApi.run(settings)
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// Fetch previously saved screening results for a job
export const fetchScreeningResults = createAsyncThunk(
  'screening/fetchResults',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const result = await screeningApi.getResults(jobId)
      return result
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// ------------------------------------------------------------
// INITIAL STATE
// ------------------------------------------------------------

const initialState: ScreeningState = {
  currentSettings: null,
  results: {},
  status: 'idle',
  activeJobId: null,
  error: null,
}

// ------------------------------------------------------------
// SLICE
// ------------------------------------------------------------

const screeningSlice = createSlice({
  name: 'screening',
  initialState,
  reducers: {
    // Save settings before running (user configures weights etc.)
    setSettings(state, action: PayloadAction<ScreeningSettings>) {
      state.currentSettings = action.payload
      state.activeJobId = action.payload.jobId
    },

    // Reset to idle (e.g. navigating away)
    resetStatus(state) {
      state.status = 'idle'
      state.error = null
    },

    clearError(state) {
      state.error = null
    },
  },

  extraReducers: (builder) => {

    // runScreening
    builder
      .addCase(runScreening.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(runScreening.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const result = action.payload
        // Store result keyed by jobId
        state.results[result.jobId] = result
        state.activeJobId = result.jobId
      })
      .addCase(runScreening.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })

    // fetchScreeningResults
    builder
      .addCase(fetchScreeningResults.fulfilled, (state, action) => {
        if (action.payload) {
          state.results[action.payload.jobId] = action.payload
        }
      })
  },
})

// ------------------------------------------------------------
// EXPORTS
// ------------------------------------------------------------

export const { setSettings, resetStatus, clearError } = screeningSlice.actions

// Selectors
export const selectScreeningStatus     = (state: { screening: ScreeningState }) => state.screening.status
export const selectScreeningError      = (state: { screening: ScreeningState }) => state.screening.error
export const selectCurrentSettings     = (state: { screening: ScreeningState }) => state.screening.currentSettings
export const selectActiveJobId         = (state: { screening: ScreeningState }) => state.screening.activeJobId
export const selectResultByJob = (jobId: string) =>
  (state: { screening: ScreeningState }): ScreeningResult | null =>
    state.screening.results[jobId] ?? null
export const selectAllResults          = (state: { screening: ScreeningState }) => state.screening.results

export default screeningSlice.reducer