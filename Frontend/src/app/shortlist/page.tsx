'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchScreeningResults, selectResultByJob, selectScreeningStatus } from '@/store/screeningSlice'
import { fetchJobById, selectJobById } from '@/store/jobsSlice'
import { ShortlistedCandidate } from '@/types'
import Topbar from '@/components/Topbar'

function RankBadge({ rank }: { rank: number }) {
  const styles: Record<number, { bg: string; color: string }> = {
    1: { bg: '#FEF9C3', color: '#854D0E' },
    2: { bg: '#F4F4F5', color: '#52525B' },
    3: { bg: '#FEF3C7', color: '#92400E' },
  }
  const s = styles[rank] ?? { bg: 'var(--um-bg)', color: 'var(--um-muted)' }
  return (
    <div style={{ width: 30, height: 30, borderRadius: '50%', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
      {rank}
    </div>
  )
}

function ScoreColor(score: number) {
  if (score >= 90) return 'var(--um-success)'
  if (score >= 75) return 'var(--um-primary)'
  if (score >= 60) return 'var(--um-warning)'
  return 'var(--um-danger)'
}

export default function ShortlistPage() {
  const dispatch     = useAppDispatch()
  const searchParams = useSearchParams()
  const jobId        = searchParams.get('jobId') || 'job-001'

  const result          = useAppSelector(selectResultByJob(jobId))
  const job             = useAppSelector(selectJobById(jobId))
  const screeningStatus = useAppSelector(selectScreeningStatus)

  useEffect(() => {
    dispatch(fetchJobById(jobId))
    if (!result) dispatch(fetchScreeningResults(jobId))
  }, [dispatch, jobId, result])

  // No results yet
  if (!result && screeningStatus !== 'loading') {
    return (
      <>
        <Topbar title="Shortlist" subtitle="AI-ranked candidates" />
        <div className="um-content">
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ width: 64, height: 64, background: 'var(--um-primary-light)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--um-primary)" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--um-text)', marginBottom: 8 }}>No screening results yet</div>
            <div style={{ fontSize: 13, color: 'var(--um-muted)', marginBottom: 24, maxWidth: 340, margin: '0 auto 24px' }}>
              Run AI screening on a job to see the ranked shortlist with Gemini AI reasoning here.
            </div>
            <Link href="/screen">
              <button className="um-btn um-btn-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Screen Applicants Now
              </button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  if (!result) return null

  const shortlist = result.shortlist

  return (
    <>
      <Topbar
        title="AI Shortlist Results"
        subtitle={`${result.jobTitle} · Screened ${result.totalScreened} applicants`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="um-btn um-btn-ghost um-btn-sm">Export CSV</button>
            <button className="um-btn um-btn-outline um-btn-sm">Export PDF</button>
          </div>
        }
      />
      <div className="um-content">

        {/* Breadcrumb */}
        <div className="um-breadcrumb">
          <Link href="/jobs" className="um-breadcrumb-link">Job Listings</Link>
          <span style={{ color: 'var(--um-border)' }}>›</span>
          <span>{result.jobTitle}</span>
          <span style={{ color: 'var(--um-border)' }}>›</span>
          <span>Shortlist</span>
        </div>

        {/* Summary stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Candidates Screened', value: result.totalScreened, color: 'var(--um-text)' },
            { label: 'Shortlisted',         value: shortlist.length,     color: 'var(--um-primary)' },
            { label: 'Top Score',           value: result.topScore,      color: 'var(--um-success)' },
            { label: 'Avg Score',           value: result.averageScore,  color: 'var(--um-text)' },
          ].map(s => (
            <div key={s.label} className="um-stat-card" style={{ flex: 1, minWidth: 110, padding: '14px 16px' }}>
              <div className="um-stat-label">{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Screened at + weights info */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', fontSize: 12, color: 'var(--um-muted)' }}>
          <span>Screened: {new Date(result.screenedAt).toLocaleString()}</span>
          <span>·</span>
          <span>
            Weights — Skills: {result.settings.weights.skills}% ·
            Experience: {result.settings.weights.experience}% ·
            Education: {result.settings.weights.education}%
          </span>
        </div>

        {/* Shortlist table */}
        <div className="um-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="um-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>#</th>
                <th>Candidate</th>
                <th style={{ width: 200 }}>Match Score</th>
                <th>Strengths</th>
                <th>Gaps</th>
                <th style={{ width: 100 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {shortlist.map((c: ShortlistedCandidate) => (
                <tr key={c.applicantId}>
                  <td><RankBadge rank={c.rank} /></td>

                  {/* Candidate info */}
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--um-text)' }}>{c.applicantName}</div>
                    <div style={{ fontSize: 11, color: 'var(--um-muted)', marginTop: 2 }}>
                      {c.yearsOfExperience}yr · {c.applicantLocation}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      {c.applicantSource === 'umurava' ? (
                        <span className="um-badge um-badge-primary" style={{ fontSize: 10 }}>Umurava Profile</span>
                      ) : (
                        <span className="um-badge um-badge-info" style={{ fontSize: 10 }}>External</span>
                      )}
                    </div>
                  </td>

                  {/* Score + reasoning */}
                  <td>
                    <div style={{ fontSize: 22, fontWeight: 800, color: ScoreColor(c.matchScore) }}>
                      {c.matchScore}
                    </div>
                    <div className="um-score-bar" style={{ width: 120 }}>
                      <div className="um-score-fill" style={{ width: `${c.matchScore}%` }} />
                    </div>
                    <div className="um-reasoning-card" style={{ marginTop: 8 }}>
                      <div className="um-reasoning-title">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                          <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        Gemini AI Reasoning
                      </div>
                      <div className="um-reasoning-text">{c.reasoning}</div>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: 'var(--um-muted)', fontStyle: 'italic' }}>
                      {c.recommendation}
                    </div>
                  </td>

                  {/* Strengths */}
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      {c.strengths.map(s => <span key={s} className="um-strength">{s}</span>)}
                    </div>
                  </td>

                  {/* Gaps */}
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      {c.gaps.map(g => <span key={g} className="um-gap">{g}</span>)}
                    </div>
                  </td>

                  {/* Action */}
                  <td>
                    <button className={`um-btn um-btn-sm ${c.rank === 1 ? 'um-btn-primary' : c.rank <= 3 ? 'um-btn-outline' : 'um-btn-ghost'}`}>
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ padding: '14px 20px', fontSize: 12, color: 'var(--um-muted)', borderTop: '1px solid var(--um-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Showing {shortlist.length} shortlisted candidates from {result.totalScreened} screened</span>
            <Link href={`/screen?jobId=${jobId}`}>
              <button className="um-btn um-btn-ghost um-btn-sm">Re-screen</button>
            </Link>
          </div>
        </div>

      </div>
    </>
  )
}