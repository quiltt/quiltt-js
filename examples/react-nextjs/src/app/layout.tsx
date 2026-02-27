import { Inter } from 'next/font/google'

import { QuilttProviderClient } from './quiltt-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Quiltt Next.js Example',
  description: 'Quiltt React SDK integrated into Next.js',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QuilttProviderClient>{children}</QuilttProviderClient>
      </body>
    </html>
  )
}
