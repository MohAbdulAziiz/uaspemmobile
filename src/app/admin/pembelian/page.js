'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/adminlayout'
import { useSession } from 'next-auth/react'

export default function PembelianPage() {
  const { data: session, status } = useSession()
  const [pembayaranList, setPembayaranList] = useState([])
  const [filteredList, setFilteredList] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [perPage, setPerPage] = useState(10)

  // Ambil data pembayaran
  useEffect(() => {
    const fetchPembayaran = async () => {
      try {
        const res = await fetch('/api/pembayaran')
        if (res.ok) {
          const data = await res.json()
          setPembayaranList(data || [])
        } else {
          console.error('Gagal mengambil data pembayaran.')
        }
      } catch (err) {
        console.error('Kesalahan saat fetch:', err)
      }
    }

    if (session?.user?.role?.toLowerCase() === 'admin') {
      fetchPembayaran()
    }
  }, [session])

  // Filter & batasan data
  useEffect(() => {
    const filtered = pembayaranList.filter(item =>
      item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredList(filtered.slice(0, perPage))
  }, [searchTerm, pembayaranList, perPage])

  // Ubah status
  const handleStatusChange = async (id, newStatus) => {
    const res = await fetch('/api/pembayaran', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    })

    if (res.ok) {
      setPembayaranList(prev =>
        prev.map(item => item.id === id ? { ...item, status: newStatus } : item)
      )
    } else {
      alert('Gagal memperbarui status.')
    }
  }

  if (status === 'loading') return <p className="p-6">Loading...</p>
  if (!session || session.user.role.toLowerCase() !== 'admin') return null

  return (
    <AdminLayout>
      <div className="px-4 sm:px-8 md:px-16 py-10">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">
          📦 Daftar Pembayaran Pelanggan
        </h2>

        {/* 🔍 Search & Per Page */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <input
            type="text"
            placeholder="Cari berdasarkan nama, email, kode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/2 border px-4 py-2 rounded shadow-sm"
          />
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="border px-3 py-2 rounded shadow-sm"
          >
            {[5, 10, 15, 25, 50, 100].map(n => (
              <option key={n} value={n}>{n} data / halaman</option>
            ))}
          </select>
        </div>

        {/* 📋 Tabel */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto text-sm text-left">
            <thead className="bg-blue-100 text-blue-800">
              <tr>
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">No HP</th>
                <th className="px-4 py-3">Bukti</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center px-4 py-6 text-gray-500">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-blue-50">
                    <td className="px-4 py-2">{item.kode}</td>
                    <td className="px-4 py-2">{item.nama}</td>
                    <td className="px-4 py-2">{item.email}</td>
                    <td className="px-4 py-2">{item.nohp}</td>
                    <td className="px-4 py-2">
                      <a
                        href={item.poto}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Lihat Bukti
                      </a>
                    </td>
                    <td className="px-4 py-2">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-semibold text-black cursor-pointer
                        bg-opacity-80
                        ${
                          {
                            'Menunggu Verifikasi': 'bg-red-300',
                            'Sedang Diproses': 'bg-blue-300',
                            'Dikirim': 'bg-indigo-300',
                            'Diterima': 'bg-green-300'
                          }[item.status] || 'bg-gray-200'
                        }`
                      }
                    >
                      {['Menunggu Verifikasi', 'Sedang Diproses', 'Dikirim', 'Diterima'].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
