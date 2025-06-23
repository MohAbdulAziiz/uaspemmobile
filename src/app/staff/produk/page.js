'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/stafflayout'
import { useSession } from 'next-auth/react'

export default function ProdukPage() {
  const { data: session, status } = useSession()
  const [produk, setProduk] = useState([])
  const [filteredProduk, setFilteredProduk] = useState([])
  const [search, setSearch] = useState('')
  const [limit, setLimit] = useState(10)

  useEffect(() => {
    fetchProduk()
  }, [])

  useEffect(() => {
    const filtered = produk.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.type?.toLowerCase().includes(search.toLowerCase()) ||
      item.deskripsi?.toLowerCase().includes(search.toLowerCase())
    )
    setFilteredProduk(filtered.slice(0, limit))
  }, [produk, search, limit])

const fetchProduk = async () => {
  const res = await fetch('/api/produkstaff')

  if (!res.ok) {
    console.error('Gagal fetch produkstaff:', res.status)
    return
  }

  const data = await res.json()
  setProduk(data)
}


  const handleVerifikasiChange = async (id, value) => {
    const res = await fetch('/api/produkstaff', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, verifikasi: value === 'true' })
    })

    if (res.ok) {
      fetchProduk()
    } else {
      alert('Gagal mengubah status verifikasi.')
    }
  }

  if (status === 'loading') return <p className="p-6">Loading...</p>
  if (!session || session?.user?.role?.toLowerCase() !== 'staff gudang') return null

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manajemen Produk</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <input
          type="text"
          placeholder="Cari produk"
          className="border px-3 py-2 rounded w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="border px-3 py-2 rounded"
        >
          {[5, 10, 15, 25, 50, 100].map((num) => (
            <option key={num} value={num}>{num} data</option>
          ))}
        </select>
      </div>

      {/* ✅ Mobile View */}
      <div className="block md:hidden space-y-4">
        {filteredProduk.map((item, i) => (
          <div key={item.id} className="border rounded p-4 shadow space-y-2">
            <div className="flex items-start space-x-4">
              {item.poto && (
                <img src={item.poto} className="w-20 h-20 object-cover rounded" />
              )}
              <div className="flex-1 space-y-1">
                <div className="text-base font-semibold">{item.name}</div>
                <div className="text-sm text-gray-600">Tipe: {item.type || '-'}</div>
                <div className="text-sm text-gray-600">
                  Harga: Rp {item.harga?.toLocaleString('id-ID')}
                </div>
                <div className="text-sm text-gray-600">Stock: {item.stock}</div>
                <div className="text-sm text-gray-600">
                  Deskripsi: {item.deskripsi || '-'}
                </div>
                <div className="text-sm">
                  Verifikasi:{' '}
                  <select
                    value={item.verifikasi ? 'true' : 'false'}
                    onChange={(e) => handleVerifikasiChange(item.id, e.target.value)}
                    className={`px-2 py-1 rounded text-white ${
                      item.verifikasi ? 'bg-green-600' : 'bg-red-600'
                    }`}
                  >
                    <option value="true">Lolos Verifikasi</option>
                    <option value="false">Belum Lolos Verifikasi</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Desktop View */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full border text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-2 border">No</th>
              <th className="p-2 border">Foto</th>
              <th className="p-2 border">Nama</th>
              <th className="p-2 border">Tipe</th>
              <th className="p-2 border">Harga</th>
              <th className="p-2 border">Stock</th>
              <th className="p-2 border">Deskripsi</th>
              <th className="p-2 border">Verifikasi</th>
            </tr>
          </thead>
          <tbody>
            {filteredProduk.map((item, i) => (
              <tr key={item.id} className="hover:bg-gray-100">
                <td className="p-2 border text-center">{i + 1}</td>
                <td className="p-2 border text-center">
                  {item.poto ? <img src={item.poto} className="w-12 h-12 object-cover rounded mx-auto" /> : '-'}
                </td>
                <td className="p-2 border">{item.name}</td>
                <td className="p-2 border">{item.type || '-'}</td>
                <td className="p-2 border">Rp {item.harga?.toLocaleString('id-ID')}</td>
                <td className="p-2 border text-center">{item.stock}</td>
                <td className="p-2 border">{item.deskripsi || '-'}</td>
                <td className="p-2 border text-center">
                  <select
                    value={item.verifikasi ? 'true' : 'false'}
                    onChange={(e) => handleVerifikasiChange(item.id, e.target.value)}
                    className={`px-2 py-1 rounded text-white ${
                      item.verifikasi ? 'bg-green-600' : 'bg-red-600'
                    }`}
                  >
                    <option value="true">Lolos Verifikasi</option>
                    <option value="false">Belum Lolos Verifikasi</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
