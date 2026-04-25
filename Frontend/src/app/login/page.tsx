'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/services/authApi'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.login(username, password)
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <Image 
              src="/umurava-logo.png" 
              alt="Umurava Logo" 
              width={60} 
              height={60}
              priority
            />
          </div>
          <h1 style={styles.title}>Umurava</h1>
          <p style={styles.subtitle}>AI-Powered Talent Screening</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={styles.form}>
          {/* Username Field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Password Field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && <div style={styles.error}>{error}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !username || !password}
            style={{
              ...styles.button,
              opacity: loading || !username || !password ? 0.6 : 1,
              cursor: loading || !username || !password ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div style={styles.demoBox}>
          <p style={styles.demoTitle}>Demo Account</p>
          <p style={styles.demoText}>Username: <code>recruiter</code></p>
          <p style={styles.demoText}>Password: <code>recruiter123</code></p>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2026 Umurava Hackathon. AI-powered recruitment platform.</p>
      </footer>
    </div>
  )
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    background: 'var(--um-bg)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  card: {
    background: 'var(--um-card)',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    border: '1px solid var(--um-border)',
    padding: '48px',
    width: '100%',
    maxWidth: '420px',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '32px',
  },
  logo: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--um-text)',
  },
  subtitle: {
    margin: '0',
    fontSize: '14px',
    color: 'var(--um-muted)',
    fontWeight: '500',
  },
  form: {
    marginBottom: '24px',
  },
  fieldGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--um-text)',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '14px',
    border: '1px solid var(--um-border)',
    borderRadius: '8px',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
  } as React.CSSProperties,
  button: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    background: 'var(--um-primary)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    marginBottom: '16px',
  },
  error: {
    padding: '12px 14px',
    marginBottom: '16px',
    fontSize: '14px',
    color: 'var(--um-danger)',
    background: 'var(--um-danger-bg)',
    borderRadius: '8px',
    border: '1px solid #FCA5A5',
  },
  demoBox: {
    padding: '16px',
    background: 'var(--um-primary-light)',
    borderRadius: '8px',
    borderLeft: '4px solid #667eea',
  },
  demoTitle: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--um-primary)',
    textTransform: 'uppercase' as const,
  },
  demoText: {
    margin: '4px 0',
    fontSize: '13px',
    color: 'var(--um-text-secondary)',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center' as const,
    fontSize: '12px',
    color: 'var(--um-muted)',
  },
}