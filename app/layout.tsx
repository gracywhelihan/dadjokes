import type { Metadata } from 'next'
import './globals.css'
import { IBM_Plex_Sans } from 'next/font/google'

const system = IBM_Plex_Sans({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Dad Jokes',
  description: 'An archive of the jokes my dad has texted me since 2022',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={system.className}>
      <body className="bg-[#008080]">{children}</body>
    </html>
  )
}
