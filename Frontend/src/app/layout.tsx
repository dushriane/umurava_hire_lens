import type { Metadata } from 'next'
import './globals.css'
import ReduxProvider from '@/store/ReduxProvider'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Umurava AI Recruiter',
  description: 'AI-powered talent screening for HR teams — Umurava Hackathon',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <div className="um-layout">
            <Sidebar />
            <main className="um-main">
              {children}
            </main>
          </div>
        </ReduxProvider>
      </body>
    </html>
  )
}