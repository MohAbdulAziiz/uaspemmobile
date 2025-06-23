'use client'

import AdminLayout from '@/components/adminlayout'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { createClient } from '@supabase/supabase-js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [stats, setStats] = useState({
    users: 0,
    produk: 0,
    review: 0,
    pembayaran: 0,
    produkByType: {},
    usersByRole: {},
  })

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') return router.replace('/login')
    if (session?.user?.role?.toLowerCase() !== 'admin') return router.replace('/')
  }, [session, status, router])

  useEffect(() => {
    const fetchStats = async () => {
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
)

      const [users, produk, review, pembayaran] = await Promise.all([
        supabase.from('users').select('role'),
        supabase.from('produk').select('type'),
        supabase.from('review').select('*'),
        supabase.from('pembayaran').select('*'),
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
  pembayaran: pembayaran.data?.length || 0,
  usersByRole,
  produkByType
})
    }

    if (session?.user?.role?.toLowerCase() === 'admin') {
      fetchStats()
    }
  }, [session])

  if (status === 'loading' || !session) {
    return <p className="p-6">Loading...</p>
  }

  const produkPieData = {
    labels: Object.keys(stats.produkByType),
    datasets: [{
      data: Object.values(stats.produkByType),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#9ccc65', '#ff7043']
    }]
  }

  const usersPieData = {
    labels: Object.keys(stats.usersByRole),
    datasets: [{
      data: Object.values(stats.usersByRole),
      backgroundColor: ['#4fc3f7', '#ba68c8', '#ffb74d']
    }]
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Selamat Datang {session.user.name}</h1>
        <p className="text-2xl font-bold mb-6">Di Halaman Admin</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card title="Users" count={stats.users} />
          <Card title="Produk" count={stats.produk} />
          <Card title="Review" count={stats.review} />
          <Card title="Pembelian" count={stats.pembayaran} />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Statistik Produk per Tipe</h2>
            <Pie data={produkPieData} />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Statistik User per Role</h2>
            <Pie data={usersPieData} />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function Card({ title, count }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 text-center">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-2xl font-bold text-blue-600">{count}</p>
    </div>
  )
}
