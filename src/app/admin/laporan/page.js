'use client'

import AdminLayout from '../../../components/adminlayout'
import { useEffect, useState, useRef } from 'react'

export default function LaporanPage() {
  const [data, setData] = useState({ users: [], produk: [] })
  const [searchUser, setSearchUser] = useState('')
  const [searchProduk, setSearchProduk] = useState('')
  const [limitUser, setLimitUser] = useState(10)
  const [limitProduk, setLimitProduk] = useState(10)
  const [isLoading, setIsLoading] = useState(true) // ✅ loading state

  const printRef = useRef()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/laporan')
        const result = await res.json()
        setData(result)
      } catch (error) {
        console.error('Gagal memuat data laporan:', error)
      } finally {
        setIsLoading(false) // ✅ set selesai
      }
    }

    fetchData()
  }, [])

const handlePrint = () => {
  if (!printRef.current) return alert('Data belum siap dicetak.')

  const printContents = printRef.current.innerHTML
  const printWindow = window.open('', '', 'height=800,width=1000')

  printWindow.document.write('<html><head><title>Laporan</title>')
  printWindow.document.write('<style>')
  printWindow.document.write(`
    body { font-family: sans-serif; padding: 20px; }
    table { border-collapse: collapse; width: 100%; font-size: 12px; }
    th, td { border: 1px solid #000; padding: 6px; text-align: left; }
    h1, h2 { margin-bottom: 10px; }
    img { max-width: 60px; max-height: 60px; object-fit: cover; }
  `)
  printWindow.document.write('</style>')
  printWindow.document.write('</head><body>')
  printWindow.document.write(printContents)
  printWindow.document.write('</body></html>')
  printWindow.document.close()

  // ⏳ Tunggu dokumen siap dicetak
  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
    // ❌ Jangan langsung close: biarkan user yang tutup jendelanya
  }
}

  const filteredUsers = (data.users || []).filter(user =>
    (user.nama || '').toLowerCase().includes(searchUser.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchUser.toLowerCase()) ||
    (user.username || '').toLowerCase().includes(searchUser.toLowerCase())
  ).slice(0, limitUser)

  const filteredProduk = (data.produk || []).filter(produk =>
    (produk.name || '').toLowerCase().includes(searchProduk.toLowerCase()) ||
    (produk.type || '').toLowerCase().includes(searchProduk.toLowerCase())
  ).slice(0, limitProduk)

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Laporan User & Produk</h1>

      <button
        onClick={handlePrint}
        disabled={isLoading}
        className={`mb-6 px-4 py-2 rounded text-white no-print ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isLoading ? 'Memuat data...' : 'Cetak Laporan'}
      </button>

      <div ref={printRef} data-print>
        {/* KOP SURAT */}
        <div className="mb-6 text-center print:text-center">
          <h1 className="text-xl font-bold">SAMSUNG STORE</h1>
          <hr className="my-2 border-black" />
        </div>

        {/* USER SECTION */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Daftar User</h2>
          <div className="overflow-x-auto">
            <table className="table-auto min-w-full border border-collapse text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-3 py-1">No</th>
                  <th className="border px-3 py-1">Foto</th>
                  <th className="border px-3 py-1">Nama</th>
                  <th className="border px-3 py-1">Username</th>
                  <th className="border px-3 py-1">Password</th>
                  <th className="border px-3 py-1">Email</th>
                  <th className="border px-3 py-1">No HP</th>
                  <th className="border px-3 py-1">Role</th>
                  <th className="border px-3 py-1">Verifikasi Via</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td className="border px-3 py-1">{index + 1}</td>
                    <td className="border px-3 py-1 text-center">
                      {user.poto ? (
                        <img src={user.poto} alt="foto" className="w-10 h-10 object-cover mx-auto rounded" />
                      ) : '-'}
                    </td>
                    <td className="border px-3 py-1">{user.nama}</td>
                    <td className="border px-3 py-1">{user.username}</td>
                    <td className="border px-3 py-1">{user.password}</td>
                    <td className="border px-3 py-1">{user.email}</td>
                    <td className="border px-3 py-1">{user.nohp}</td>
                    <td className="border px-3 py-1">{user.role || '-'}</td>
                    <td className="border px-3 py-1">{user.verifikasi_via || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* PRODUK SECTION */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Daftar Produk</h2>
          <table className="table-auto w-full border border-collapse text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-3 py-1">No</th>
                <th className="border px-3 py-1">Foto</th>
                <th className="border px-3 py-1">Nama Produk</th>
                <th className="border px-3 py-1">Tipe</th>
                <th className="border px-3 py-1">Stok</th>
              </tr>
            </thead>
            <tbody>
              {filteredProduk.map((item, index) => (
                <tr key={item.id}>
                  <td className="border px-3 py-1">{index + 1}</td>
                  <td className="border px-3 py-1 text-center">
                    {item.poto ? (
                      <img src={item.poto} className="w-10 h-10 object-cover mx-auto rounded" />
                    ) : '-'}
                  </td>
                  <td className="border px-3 py-1">{item.name}</td>
                  <td className="border px-3 py-1">{item.type || '-'}</td>
                  <td className="border px-3 py-1">{item.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AdminLayout>
  )
}
