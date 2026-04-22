'use client'
import Link from 'next/link'

interface TopbarProps {
  title: string
  subtitle: string
  action?: React.ReactNode
}

export default function Topbar({ title, subtitle, action }: TopbarProps) {
  return (
    <header className="um-topbar">
      <div>
        <div className="um-topbar-title">{title}</div>
        <div className="um-topbar-sub">{subtitle}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="um-ai-badge">
          <span className="um-dot-live" />
          Gemini AI Active
        </div>
        {action ?? (
          <Link href="/jobs/create">
            <button className="um-btn um-btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Job
            </button>
          </Link>
        )}
      </div>
    </header>
  )
}