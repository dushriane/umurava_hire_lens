import type { Metadata } from 'next'
import './globals.css'
import ReduxProvider from '@/store/ReduxProvider'
import RootLayoutContent from './layout-content'

export const metadata: Metadata = {
  title: 'Umurava AI Recruiter',
  description: 'AI-powered talent screening for HR teams — Umurava Hackathon',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <RootLayoutContent>{children}</RootLayoutContent>
        </ReduxProvider>
      </body>
    </html>
  )
}