import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import jobsReducer       from './jobsSlice'
import applicantsReducer from './applicantsSlice'
import screeningReducer  from './screeningSlice'
import type { RootState } from '@/types'

// ------------------------------------------------------------
// STORE
// ------------------------------------------------------------

export const store = configureStore({
  reducer: {
    jobs:       jobsReducer,
    applicants: applicantsReducer,
    screening:  screeningReducer,
  },
})

// ------------------------------------------------------------
// TYPED HOOKS
// Use these everywhere instead of plain useDispatch / useSelector
// 
// Example usage in a component:
//   const dispatch = useAppDispatch()
//   const jobs = useAppSelector(selectAllJobs)
// ------------------------------------------------------------

export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector