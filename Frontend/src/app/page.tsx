'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchJobs, selectAllJobs, selectJobsStatus } from '@/store/jobsSlice'
import { selectAllResults } from '@/store/screeningSlice'
import Topbar from '@/components/Topbar'

function StatusBadge({ status }: { status: string }) {
  if (status === 'active')    return <span className="um-badge um-badge-active">Active</span>
  if (status === 'screening') return <span className="um-badge um-badge-yellow">Screening</span>
  return <span className="um-badge um-badge-closed">Closed</span>
}

export default function DashboardPage() {
  const dispatch   = useAppDispatch()
  const jobs       = useAppSelector(selectAllJobs)
  const jobsStatus = useAppSelector(selectJobsStatus)
  const results    = useAppSelector(selectAllResults)

  useEffect(() => {
    if (jobsStatus === 'idle') dispatch(fetchJobs())
  }, [dispatch, jobsStatus])

  const activeJobs      = jobs.filter(j => j.status === 'active').length
  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicantCount, 0)
  const screenedCount   = Object.keys(results).length
  const avgScore        = screenedCount > 0
    ? Math.round(Object.values(results).reduce((s, r) => s + r.averageScore, 0) / screenedCount)
    : 0

  return (
    <>
      <Topbar title="Dashboard" subtitle="Welcome back — here's your recruiting overview" />
      <div className="um-content">

        {/* Stats */}
        <div className="um-grid-4" style={{ marginBottom: 28 }}>
          <div className="um-stat-card">
            <div className="um-stat-label">Active Jobs</div>
            <div className="um-stat-value">{activeJobs}</div>
            <div className="um-stat-trend">+3 this week</div>
          </div>
          <div className="um-stat-card">
            <div className="um-stat-label">Total Applicants</div>
            <div className="um-stat-value">{totalApplicants}</div>
            <div className="um-stat-trend">across all roles</div>
          </div>
          <div className="um-stat-card">
            <div className="um-stat-label">Jobs Screened</div>
            <div className="um-stat-value">{screenedCount}</div>
            <div className="um-stat-trend">via Gemini AI</div>
          </div>
          <div className="um-stat-card">
            <div className="um-stat-label">Avg Match Score</div>
            <div className="um-stat-value">{avgScore > 0 ? `${avgScore}%` : '—'}</div>
            <div className="um-stat-trend" style={{ color: avgScore === 0 ? 'var(--um-muted)' : undefined }}>
              {avgScore > 0 ? 'across screened roles' : 'run screening first'}
            </div>
          </div>
        </div>

        {/* Recent jobs header */}
        <div className="um-flex-between" style={{ marginBottom: 18 }}>
          <div className="um-section-title">Recent Job Listings</div>
          <Link href="/jobs">
            <button className="um-btn um-btn-ghost um-btn-sm">View all</button>
          </Link>
        </div>

        {/* Loading */}
        {jobsStatus === 'loading' && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--um-muted)', fontSize: 13 }}>
            <div className="um-ai-spinner" style={{ width: 32, height: 32, borderWidth: 2, margin: '0 auto 12px' }} />
            Loading jobs...
          </div>
        )}

        {/* Jobs list */}
        {jobsStatus === 'succeeded' && jobs.slice(0, 4).map((job) => (
          <div
            key={job.id}
            className="um-card"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, cursor: 'pointer', transition: 'border-color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--um-primary)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--um-border)')}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--um-text)' }}>{job.title}</div>
                <StatusBadge status={job.status} />
                {results[job.id] && (
                  <span className="um-badge um-badge-primary" style={{ fontSize: 10 }}>Screened ✓</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--um-muted)', marginBottom: 10 }}>
                <span>{job.location}</span>
                <span>{job.type}</span>
                <span>Posted {job.postedDate}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {job.requiredSkills.slice(0, 4).map(s => (
                  <span key={s} className="um-tag">{s}</span>
                ))}
                {job.requiredSkills.length > 4 && (
                  <span className="um-tag">+{job.requiredSkills.length - 4}</span>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 20 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--um-primary)' }}>
                {job.applicantCount}
              </div>
              <div style={{ fontSize: 11, color: 'var(--um-muted)' }}>applicants</div>
              {results[job.id] && (
                <div style={{ fontSize: 12, color: 'var(--um-success)', fontWeight: 600, marginTop: 4 }}>
                  Top: {results[job.id].topScore}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {jobsStatus === 'succeeded' && jobs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 14, color: 'var(--um-muted)', marginBottom: 16 }}>No jobs yet</div>
            <Link href="/jobs/create">
              <button className="um-btn um-btn-primary">Create your first job</button>
            </Link>
          </div>
        )}

        {/* Tip box */}
        <div className="um-highlight-box" style={{ marginTop: 8 }}>
          <div className="um-highlight-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
            </svg>
            How it works
          </div>
          <div className="um-highlight-sub">
            1. <strong>Create a job</strong> with requirements and ideal candidate profile →{' '}
            2. <strong>Add applicants</strong> from Umurava profiles or upload CSV/PDFs →{' '}
            3. <strong>Run AI screening</strong> and get a ranked shortlist with Gemini AI reasoning.
          </div>
        </div>

      </div>
    </>
  )
}