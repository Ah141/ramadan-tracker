import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'متابع رمضان',
  description: 'تابع عاداتك في رمضان وابقى على المسار',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
