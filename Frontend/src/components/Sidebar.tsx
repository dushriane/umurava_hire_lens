'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    section: 'Main',
    links: [
      {
        href: '/', label: 'Dashboard',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
      },
      {
        href: '/jobs', label: 'Job Listings',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
      },
      {
        href: '/jobs/create', label: 'Create Job',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
      },
      {
        href: '/screen', label: 'Screen Applicants',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
      },
    ],
  },
  {
    section: 'Results',
    links: [
      {
        href: '/shortlist', label: 'Shortlist',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
      },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside className="um-sidebar">
      <div className="um-sidebar-logo">
        <div style={{ width: 36, height: 36, background: 'white', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 4 }}>
          <img src="/umurava-logo.png" alt="Umurava" width={28} height={28} style={{ objectFit: 'contain' }} />
        </div>
        <div>
          <div className="um-logo-text">Umurava</div>
          <div className="um-logo-sub">AI Recruiter</div>
        </div>
      </div>

      {navItems.map((section) => (
        <div key={section.section} className="um-nav-section">
          <div className="um-nav-label">{section.section}</div>
          {section.links.map((link) => (
            <Link key={link.href} href={link.href} className={`um-nav-item ${isActive(link.href) ? 'active' : ''}`}>
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>
      ))}

      <div className="um-sidebar-bottom">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="um-avatar">HC</div>
          <div>
            <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>HerCode Team</div>
            <div style={{ color: 'var(--um-sidebar-text)', fontSize: 11 }}>Recruiter</div>
          </div>
        </div>
      </div>
    </aside>
  )
}