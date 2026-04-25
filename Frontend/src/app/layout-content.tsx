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
    // 1. remove
    console.log('layout-content useEffect running, pathname:', pathname)
  
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('umurava_token')
      //2. remove
      console.log('Token from localStorage:', storedToken)
      setToken(storedToken)
      
      // Redirect to login if no token and not already on login page
      if (!storedToken && !pathname.startsWith('/login')) {
        //3. remove
        console.log('No token and not on login, redirecting to login')
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