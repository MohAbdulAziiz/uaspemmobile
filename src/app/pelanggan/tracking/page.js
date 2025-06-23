'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { createClient } from '@supabase/supabase-js'
import PelangganLayout from '@/components/pelangganlayout'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function PelangganPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [stats, setStats] = useState({
    users: 0,
    produk: 0,
    review: 0,
    pembelian: 0,
    produkByType: {},
    usersByRole: {},
  })

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') return router.replace('/login')
    if (session?.user?.role?.toLowerCase() !== 'pelanggan') return router.replace('/')
  }, [session, status, router])

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      const [users, produk, review, pembelian] = await Promise.all([
        supabase.from('users').select('role'),
        supabase.from('produk').select('type'),
        supabase.from('review').select('*'),
        supabase.from('bayar').select('*'),
      ])

      const usersByRole = {}
      users.data?.forEach(u => {
        const role = u.role || 'Unknown'
        usersByRole[role] = (usersByRole[role] || 0) + 1
      })

      const produkByType = {}
      produk.data?.forEach(p => {
        const type = p.type || 'Unknown'
        produkByType[type] = (produkByType[type] || 0) + 1
      })

      setStats({
        users: users.data?.length || 0,
        produk: produk.data?.length || 0,
        review: review.data?.length || 0,
        pembelian: pembelian.data?.length || 0,
        usersByRole,
        produkByType
      })
    }

    if (session?.user?.role?.toLowerCase() === 'pelanggan') {
      fetchStats()
    }
  }, [session])

  if (status === 'loading' || !session) {
    return <p className="p-6">Loading...</p>
  }

  return (
    <PelangganLayout noPadding>
<section id="home" className="relative w-full h-screen overflow-hidden m-0 p-0">
  {/* Background Video */}
  <video
    className="absolute top-0 left-0 w-full h-full object-cover"
    autoPlay
    muted
    loop
    playsInline
  >
    <source src="/samsung.mp4" type="video/mp4" />
    Browser Anda tidak mendukung tag video.
  </video>

  {/* Overlay Transparan */}
  <div className="absolute inset-0 bg-gradient-to-r from-black via-blue-900 to-black opacity-70 z-10" />

  {/* Konten Tengah */}
  <div className="relative z-20 flex items-center justify-center h-full px-6 text-center">
    <div className="text-white max-w-2xl">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
        Tracking Pesanan
      </h1>
      <p className="text-2xl font-semibold drop-shadow-md">
        Lacak status dan perjalanan pesanan Anda secara real-time
      </p>
    </div>
  </div>
</section>
    </PelangganLayout>
  )
}
