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
      <body className="bg-[#0a0a0a] text-slate-100 flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto min-w-0">
          {children}
        </main>
      </body>
    </html>
  )
}
