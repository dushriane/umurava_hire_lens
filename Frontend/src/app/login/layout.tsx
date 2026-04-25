import type { Metadata } from 'next'

import ReduxProvider from '@/store/ReduxProvider'

export const metadata: Metadata = {
  title: 'Login - Umurava AI Recruiter',
  description: 'Sign in to your recruiter account',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
        <ReduxProvider>
          {children}
        </ReduxProvider>
  )
}