'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchJobs, selectAllJobs, selectJobById } from '@/store/jobsSlice'
import {
  fetchApplicantsByJob, uploadCsvApplicants, uploadResumeApplicants,
  toggleApplicantSelection, selectAllApplicants as selectAllApplicantIds,
  selectApplicantsByJob, selectSelectedIds, selectUploadStatus,
} from '@/store/applicantsSlice'
import { runScreening, setSettings, selectScreeningStatus } from '@/store/screeningSlice'
import { ScreeningSettings } from '@/types'
import Topbar from '@/components/Topbar'

type Mode = 'umurava' | 'external'
type ShortlistSize = 5 | 10 | 20

export default function ScreenPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const dispatch     = useAppDispatch()

  const jobIdParam      = searchParams.get('jobId')
  const jobs            = useAppSelector(selectAllJobs)
  const job             = useAppSelector(selectJobById(jobIdParam))
  const applicants      = useAppSelector(selectApplicantsByJob(jobIdParam))
  const selectedIds     = useAppSelector(selectSelectedIds)
  const uploadStatus    = useAppSelector(selectUploadStatus)
  const screeningStatus = useAppSelector(selectScreeningStatus)

  const [mode, setMode]                   = useState<Mode>('umurava')
  const [shortlistSize, setShortlistSize] = useState<ShortlistSize>(10)
  const [weightsSkills, setWeightsSkills] = useState(40)
  const [weightsExp,    setWeightsExp]    = useState(35)
  const [weightsEdu,    setWeightsEdu]    = useState(15)
  const [selectedJobId, setSelectedJobId] = useState(jobIdParam || '')

  // Load jobs + applicants on mount
  useEffect(() => {
    dispatch(fetchJobs())
  }, [dispatch])

  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id || (jobs[0] as any)._id)
    }
  }, [jobs, selectedJobId])

  useEffect(() => {
    if (selectedJobId) {
      dispatch(fetchApplicantsByJob(selectedJobId))
    }
  }, [dispatch, selectedJobId])

  // Redirect to shortlist once screening completes
  useEffect(() => {
    if (screeningStatus === 'succeeded') {
      router.push('/shortlist?jobId=' + selectedJobId)
    }
  }, [screeningStatus, router, selectedJobId])

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) dispatch(uploadCsvApplicants({ jobId: selectedJobId, file }))
  }

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) dispatch(uploadResumeApplicants({ jobId: selectedJobId, files }))
  }

  const handleRunScreening = async () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one applicant to screen.')
      return
    }
    const weightsRelevance = 100 - weightsSkills - weightsExp - weightsEdu
    const settings: ScreeningSettings = {
      jobId: selectedJobId,
      applicantIds: selectedIds,
      shortlistSize,
      weights: {
        skills:     weightsSkills,
        experience: weightsExp,
        education:  weightsEdu,
        relevance:  Math.max(0, weightsRelevance),
      },
    }
    dispatch(setSettings(settings))
    dispatch(runScreening(settings))
  }

  const isRunning = screeningStatus === 'loading'

  // AI Running screen
  if (isRunning) {
    return (
      <>
        <Topbar title="AI Screening in Progress" subtitle="Gemini AI is analyzing your applicants..." />
        <div className="um-content">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="um-ai-spinner" />
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--um-text)', marginBottom: 10 }}>
              Gemini AI is screening applicants
            </div>
            <div style={{ fontSize: 13, color: 'var(--um-muted)', maxWidth: 360, margin: '0 auto 28px', lineHeight: 1.7 }}>
              Analyzing {selectedIds.length} candidate profiles against your job requirements.
              This usually takes 15–30 seconds.
            </div>
            {/* Progress steps */}
            <div style={{ maxWidth: 380, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
              {[
                { label: 'Parsing job requirements',          state: 'done'    },
                { label: `Loading ${selectedIds.length} applicant profiles`, state: 'done' },
                { label: 'Scoring skills & experience match', state: 'running' },
                { label: 'Generating candidate reasoning',    state: 'wait'    },
                { label: 'Building ranked shortlist',         state: 'wait'    },
              ].map(step => (
                <div
                  key={step.label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 8,
                    background: 'white', border: '1px solid var(--um-border)',
                    fontSize: 13,
                    color: step.state === 'running' ? 'var(--um-text)' : 'var(--um-muted)',
                    fontWeight: step.state === 'running' ? 600 : 400,
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: step.state === 'done' ? 'var(--um-success)'
                      : step.state === 'running' ? 'var(--um-primary)'
                      : 'var(--um-border)',
                    animation: step.state === 'running' ? 'um-pulse 1s ease-in-out infinite' : 'none',
                  }} />
                  {step.label}
                  {step.state === 'done' && <span style={{ marginLeft: 'auto', color: 'var(--um-success)', fontSize: 12 }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Topbar title="Screen Applicants" subtitle="Select candidates and trigger AI-powered screening" />
      <div className="um-content">

        <div className="um-breadcrumb">
          <Link href="/jobs" className="um-breadcrumb-link">Job Listings</Link>
          <span style={{ color: 'var(--um-border)' }}>›</span>
          <span>{job?.title ?? 'Select a job'}</span>
          <span style={{ color: 'var(--um-border)' }}>›</span>
          <span>Screen Applicants</span>
        </div>

        {/* Job selector */}
        <div className="um-card" style={{ marginBottom: 16, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div>
              <label className="um-label" style={{ marginBottom: 4 }}>Screening for job</label>
              <select
                className="um-input"
                style={{ maxWidth: 360 }}
                value={selectedJobId}
                onChange={e => setSelectedJobId(e.target.value)}
              >
                {jobs.map(j => {
                  const safeId = j.id || (j as any)._id;
                  return (
                    <option key={safeId} value={safeId}>{j.title} ({j.applicantCount || 0} applicants)</option>
                  )
                })}
              </select>
            </div>
            {job && (
              <div style={{ marginTop: 18 }}>
                <span className="um-badge um-badge-primary" style={{ textTransform: 'capitalize' }}>{job.experienceLevel}</span>
                {' '}
                <span className="um-badge um-badge-info">{job.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mode toggle */}
        <div className="um-mode-toggle">
          <button className={`um-mode-btn ${mode === 'umurava' ? 'active' : ''}`} onClick={() => setMode('umurava')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
            Umurava Profiles ({applicants.filter(a => a.source === 'umurava').length})
          </button>
          <button className={`um-mode-btn ${mode === 'external' ? 'active' : ''}`} onClick={() => setMode('external')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            External Upload ({applicants.filter(a => a.source === 'external').length})
          </button>
        </div>

        {/* Umurava Profiles Tab */}
        {mode === 'umurava' && (
          <div className="um-card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="um-card-title">Applicants from Umurava Platform</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="um-btn um-btn-ghost um-btn-sm"
                  onClick={() => dispatch(selectAllApplicantIds(applicants.filter(a => a.source === 'umurava').map(a => a.id)))}
                >
                  Select All
                </button>
                <button
                  className="um-btn um-btn-ghost um-btn-sm"
                  onClick={() => dispatch(selectAllApplicantIds([]))}
                >
                  Clear
                </button>
              </div>
            </div>

            {uploadStatus === 'uploading' ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--um-muted)', fontSize: 13 }}>
                <div className="um-ai-spinner" style={{ width: 28, height: 28, borderWidth: 2, margin: '0 auto 10px' }} />
                Loading profiles...
              </div>
            ) : (
              applicants.filter(a => a.source === 'umurava').map(applicant => {
                const isSelected = selectedIds.includes(applicant.id)
                const profile = applicant as any
                return (
                  <div
                    key={applicant.id}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--um-border)', cursor: 'pointer' }}
                    onClick={() => dispatch(toggleApplicantSelection(applicant.id))}
                  >
                    {/* Checkbox */}
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 2,
                      border: `2px solid ${isSelected ? 'var(--um-primary)' : 'var(--um-border)'}`,
                      background: isSelected ? 'var(--um-primary)' : 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--um-text)' }}>
                        {applicant.fullName}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--um-muted)', marginTop: 2 }}>
                        {profile.yearsOfExperience}yr exp · {applicant.skills.slice(0, 3).join(', ')} · {applicant.location}
                      </div>
                    </div>
                    {/* Profile completeness */}
                    {profile.profileCompleteness === 100 ? (
                      <span className="um-badge um-badge-active" style={{ fontSize: 10 }}>Profile Complete</span>
                    ) : (
                      <span className="um-badge um-badge-pending" style={{ fontSize: 10 }}>
                        Profile {profile.profileCompleteness}%
                      </span>
                    )}
                  </div>
                )
              })
            )}

            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--um-muted)' }}>
              {selectedIds.length} of {applicants.filter(a => a.source === 'umurava').length} selected
            </div>
          </div>
        )}

        {/* External Upload Tab */}
        {mode === 'external' && (
          <div className="um-card" style={{ marginBottom: 16 }}>
            <div className="um-card-title" style={{ marginBottom: 16 }}>Upload External Applicants</div>

            {/* CSV Upload */}
            <label style={{ display: 'block', cursor: 'pointer' }}>
              <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvUpload} />
              <div className="um-upload-zone" style={{ marginBottom: 16 }}>
                <div className="um-upload-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--um-primary)" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--um-text)', marginBottom: 4 }}>
                  Upload CSV Spreadsheet
                </div>
                <div style={{ fontSize: 12, color: 'var(--um-muted)' }}>
                  Click to browse · .csv supported
                </div>
                {uploadStatus === 'uploading' && (
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--um-primary)', fontWeight: 600 }}>
                    Uploading & parsing...
                  </div>
                )}
              </div>
            </label>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 16px' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--um-border)' }} />
              <span style={{ fontSize: 12, color: 'var(--um-muted)' }}>or upload resumes</span>
              <div style={{ flex: 1, height: 1, background: 'var(--um-border)' }} />
            </div>

            {/* Resume Upload */}
            <label style={{ display: 'block', cursor: 'pointer' }}>
              <input type="file" accept=".pdf" multiple style={{ display: 'none' }} onChange={handleResumeUpload} />
              <div className="um-upload-zone">
                <div className="um-upload-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--um-primary)" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--um-text)', marginBottom: 4 }}>
                  Upload PDF Resumes
                </div>
                <div style={{ fontSize: 12, color: 'var(--um-muted)' }}>
                  Multiple files allowed · Gemini AI will parse each resume
                </div>
              </div>
            </label>

            {/* Show uploaded external applicants */}
            {applicants.filter(a => a.source === 'external').length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--um-text)', marginBottom: 10 }}>
                  Uploaded applicants
                </div>
                {applicants.filter(a => a.source === 'external').map(applicant => (
                  <div
                    key={applicant.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--um-border)', cursor: 'pointer' }}
                    onClick={() => dispatch(toggleApplicantSelection(applicant.id))}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                      border: `2px solid ${selectedIds.includes(applicant.id) ? 'var(--um-primary)' : 'var(--um-border)'}`,
                      background: selectedIds.includes(applicant.id) ? 'var(--um-primary)' : 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {selectedIds.includes(applicant.id) && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{applicant.fullName}</div>
                      <div style={{ fontSize: 12, color: 'var(--um-muted)' }}>
                        {applicant.skills.join(', ')}
                      </div>
                    </div>
                    <span className="um-badge um-badge-info" style={{ fontSize: 10 }}>External</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Settings */}
        <div className="um-card">
          <div className="um-card-title" style={{ marginBottom: 4 }}>AI Screening Settings</div>
          <div className="um-card-sub" style={{ marginBottom: 20 }}>
            Configure how Gemini AI weights and evaluates candidates.
            Weights must not exceed 100% combined.
          </div>

          <div className="um-grid-3" style={{ marginBottom: 8 }}>
            <div className="um-form-group" style={{ margin: 0 }}>
              <label className="um-label">Shortlist Size</label>
              <select
                className="um-input"
                value={shortlistSize}
                onChange={e => setShortlistSize(Number(e.target.value) as ShortlistSize)}
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
              </select>
            </div>
            <div className="um-form-group" style={{ margin: 0 }}>
              <label className="um-label">Skills Weight (%)</label>
              <input
                type="number" className="um-input" min={0} max={100}
                value={weightsSkills}
                onChange={e => setWeightsSkills(Number(e.target.value))}
              />
            </div>
            <div className="um-form-group" style={{ margin: 0 }}>
              <label className="um-label">Experience Weight (%)</label>
              <input
                type="number" className="um-input" min={0} max={100}
                value={weightsExp}
                onChange={e => setWeightsExp(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Weight summary */}
          <div style={{ fontSize: 12, color: 'var(--um-muted)', marginBottom: 20 }}>
            Skills {weightsSkills}% · Experience {weightsExp}% · Education {weightsEdu}% · Relevance {Math.max(0, 100 - weightsSkills - weightsExp - weightsEdu)}%
          </div>

          <div className="um-flex-between">
            <div style={{ fontSize: 13, color: 'var(--um-muted)' }}>
              {selectedIds.length} candidates selected
            </div>
            <button
              className="um-btn um-btn-primary"
              onClick={handleRunScreening}
              disabled={selectedIds.length === 0}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Run AI Screening ({selectedIds.length} candidates)
            </button>
          </div>
        </div>

      </div>
    </>
  )
}