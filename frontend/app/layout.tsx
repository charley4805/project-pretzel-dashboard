import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Project Pretzel Dashboard',
  description: 'Internal Dashboard for Project Pretzel ecosystem',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-slate-100">{children}</body>
    </html>
  )
}
