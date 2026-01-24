import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fundly',
  description: 'Connect with real-asset investment opportunities in shipping and construction',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.cdnfonts.com/css/circular-std" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
