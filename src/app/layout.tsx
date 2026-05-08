import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Quiniela Mundial 2026',
  description: 'La quiniela del Mundial 2026 con tus amigos 🏆',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
