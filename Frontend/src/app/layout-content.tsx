'use client'
import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [token, setToken] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('umurava_token')
      setToken(storedToken)
      
      // Redirect to login if no token and not already on login page
      if (!storedToken && !pathname.startsWith('/login')) {
        router.push('/login')
      }
      setLoading(false)
    }
  }, [router, pathname])

  if (loading) return <div>Loading...</div>

  // Login page doesn't need sidebar
  if (pathname.startsWith('/login')) {
    return children
  }

  // Protected pages need sidebar
  return (
    <div className="um-layout">
      <Sidebar />
      <main className="um-main">
        {children}
      </main>
    </div>
  )
}