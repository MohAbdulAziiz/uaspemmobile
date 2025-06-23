import './globals.css'
import { Inter } from 'next/font/google'
import MySessionProvider from '@/components/session-provider' // ✅ Import komponen client

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Samsung Store',
  description: 'Toko HP Samsung terbaik',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <MySessionProvider>
          <main className="flex-1">{children}</main>
        </MySessionProvider>
      </body>
    </html>
  )
}
