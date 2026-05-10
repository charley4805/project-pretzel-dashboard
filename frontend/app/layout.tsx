import './globals.css'
import type { Metadata } from 'next'
import { Sidebar } from '@/components/ui/sidebar'

export const metadata: Metadata = {
  title: 'Project Pretzel — Command Center',
  description: 'Internal dashboard for the Pretzel ecosystem',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-pretzel-walnut text-slate-100">
        <Sidebar />
        <main className="md:pl-56 min-h-screen overflow-y-auto">
          {/* Spacer for the mobile hamburger button */}
          <div className="h-14 md:h-0" />
          {children}
        </main>
      </body>
    </html>
  )
}

