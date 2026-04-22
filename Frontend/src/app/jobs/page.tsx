'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchJobs, selectAllJobs, selectJobsStatus, deleteJob } from '@/store/jobsSlice'
import { selectAllResults } from '@/store/screeningSlice'
import Topbar from '@/components/Topbar'
import { Job } from '@/types'

function StatusBadge({ status }: { status: string }) {
  if (status === 'active')    return <span className="um-badge um-badge-active">Active</span>
  if (status === 'screening') return <span className="um-badge um-badge-yellow">Screening</span>
  if (status === 'draft')     return <span className="um-badge um-badge-closed">Draft</span>
  return <span className="um-badge um-badge-closed">Closed</span>
}

export default function JobsPage() {
  const dispatch      = useAppDispatch()
  const jobs          = useAppSelector(selectAllJobs)
  const jobsStatus    = useAppSelector(selectJobsStatus)
  const results       = useAppSelector(selectAllResults)

  const [search,     setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')

  useEffect(() => {
    if (jobsStatus === 'idle') dispatch(fetchJobs())
  }, [dispatch, jobsStatus])

  // Derived: unique locations for filter
  const locations = Array.from(new Set(jobs.map(j => j.location)))

  // Filter logic
  const filtered = jobs.filter(job => {
    const matchSearch   = job.title.toLowerCase().includes(search.toLowerCase()) ||
                          job.requiredSkills.some(s => s.toLowerCase().includes(search.toLowerCase()))
    const matchStatus   = statusFilter === 'all' || job.status === statusFilter
    const matchLocation = locationFilter === 'all' || job.location === locationFilter
    return matchSearch && matchStatus && matchLocation
  })

  const handleDelete = (e: React.MouseEvent, jobId: string) => {
    e.preventDefault()
    if (confirm('Are you sure you want to delete this job?')) {
      dispatch(deleteJob(jobId))
    }
  }

  return (
    <>
      <Topbar title="Job Listings" subtitle="Manage all open and closed positions" />
      <div className="um-content">

        {/* Filters + New Job button */}
        <div className="um-flex-between" style={{ marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              className="um-input"
              style={{ maxWidth: 240 }}
              placeholder="Search by title or skill..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="um-input"
              style={{ maxWidth: 140 }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="screening">Screening</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
            <select
              className="um-input"
              style={{ maxWidth: 200 }}
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
            >
              <option value="all">All Locations</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            {filtered.length !== jobs.length && (
              <span style={{ fontSize: 12, color: 'var(--um-muted)' }}>
                {filtered.length} of {jobs.length} jobs
              </span>
            )}
          </div>
          <Link href="/jobs/create">
            <button className="um-btn um-btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Job
            </button>
          </Link>
        </div>

        {/* Loading */}
        {jobsStatus === 'loading' && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--um-muted)', fontSize: 13 }}>
            <div className="um-ai-spinner" style={{ width: 32, height: 32, borderWidth: 2, margin: '0 auto 12px' }} />
            Loading jobs...
          </div>
        )}

        {/* Job cards */}
        {filtered.map((job: Job) => (
          <div
            key={job.id}
            className="um-card"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--um-text)' }}>{job.title}</div>
                <StatusBadge status={job.status} />
                {results[job.id] && (
                  <span className="um-badge um-badge-primary" style={{ fontSize: 10 }}>AI Screened ✓</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--um-muted)', marginBottom: 10, flexWrap: 'wrap' }}>
                <span>{job.location}</span>
                <span>{job.type}</span>
                <span>{job.department}</span>
                <span>Posted {job.postedDate}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {job.requiredSkills.slice(0, 5).map(s => (
                  <span key={s} className="um-tag">{s}</span>
                ))}
                {job.requiredSkills.length > 5 && (
                  <span className="um-tag">+{job.requiredSkills.length - 5} more</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0, marginLeft: 20 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--um-primary)' }}>{job.applicantCount}</div>
                <div style={{ fontSize: 11, color: 'var(--um-muted)' }}>applicants</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button
                  className="um-btn um-btn-ghost um-btn-sm"
                  onClick={e => handleDelete(e, job.id)}
                >
                  Delete
                </button>
                <Link href={`/jobs/create?edit=${job.id}`}>
                  <button className="um-btn um-btn-ghost um-btn-sm">Edit</button>
                </Link>
                {results[job.id] ? (
                  <Link href="/shortlist">
                    <button className="um-btn um-btn-primary um-btn-sm">View Results</button>
                  </Link>
                ) : (
                  <Link href={`/screen?jobId=${job.id}`}>
                    <button className="um-btn um-btn-outline um-btn-sm">Screen Now</button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {jobsStatus === 'succeeded' && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 14, color: 'var(--um-muted)', marginBottom: 16 }}>
              {search || statusFilter !== 'all' ? 'No jobs match your filters' : 'No jobs yet'}
            </div>
            {!search && statusFilter === 'all' && (
              <Link href="/jobs/create">
                <button className="um-btn um-btn-primary">Create your first job</button>
              </Link>
            )}
          </div>
        )}

      </div>
    </>
  )
}