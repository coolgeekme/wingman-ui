import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Wingman',
  description: 'Your private AI agent — authenticated and ready.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="overflow-hidden h-screen">
        {children}
      </body>
    </html>
  )
}
