import type { Metadata } from ‘next’
import ‘./globals.css’
import { AuthProvider } from ‘@/lib/auth-context’
import Navbar from ‘@/components/Navbar’

export const metadata: Metadata = {
title: ‘Quiniela Mundial 2026’,
description: ‘La quiniela del Mundial 2026’,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="es">
<body>
{/* Animated background */}
<div className="world-bg">
<div className="bg-slides">
<div className="bg-slide bg-slide-1" />
<div className="bg-slide bg-slide-2" />
<div className="bg-slide bg-slide-3" />
<div className="bg-slide bg-slide-4" />
</div>
</div>
<AuthProvider>
<Navbar />
<div className="nike-stripe" />
<main style={{ position: ‘relative’, zIndex: 1 }}>
{children}
</main>
</AuthProvider>
</body>
</html>
)
}