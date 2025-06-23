'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/adminlayout'
import { useSession } from 'next-auth/react'

export default function ProdukPage() {
  const { data: session, status } = useSession()
  const [produk, setProduk] = useState([])
  const [filteredProduk, setFilteredProduk] = useState([])
  const [search, setSearch] = useState('')
  const [limit, setLimit] = useState(10)
  const [showForm, setShowForm] = useState(false)
  const [editProduk, setEditProduk] = useState(null)
  const [form, setForm] = useState({
    name: '', type: '', harga: '', stock: '', deskripsi: '', poto: null, fotoLama: ''
  })

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
    const res = await fetch('/api/produk')
    const data = await res.json()
    setProduk(data)
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'poto') {
      setForm(prev => ({ ...prev, poto: files[0] }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('type', form.type)
    formData.append('harga', form.harga)
    formData.append('stock', form.stock)
    formData.append('deskripsi', form.deskripsi)

    if (form.poto) {
      formData.append('poto', form.poto)
    } else if (form.fotoLama) {
      formData.append('fotoLama', form.fotoLama)
    }

    if (editProduk) {
      formData.append('id', editProduk.id)
      await fetch('/api/produk', {
        method: 'PUT',
        body: formData
      })
    } else {
      await fetch('/api/produk', {
        method: 'POST',
        body: formData
      })
    }

    setShowForm(false)
    setEditProduk(null)
    setForm({ name: '', type: '', harga: '', stock: '', deskripsi: '', poto: null, fotoLama: '' })
    fetchProduk()
  }

  const openEdit = (item) => {
    setEditProduk(item)
    setForm({
      name: item.name,
      type: item.type || '',
      harga: item.harga,
      stock: item.stock,
      deskripsi: item.deskripsi || '',
      poto: null,
      fotoLama: item.poto || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      await fetch(`/api/produk?id=${id}`, { method: 'DELETE' })
      fetchProduk()
    }
  }

  if (status === 'loading') return <p className="p-6">Loading...</p>
  if (!session || session?.user?.role?.toLowerCase() !== 'admin') return null

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manajemen Produk</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditProduk(null)
            setForm({ name: '', type: '', harga: '', stock: '', deskripsi: '', poto: null, fotoLama: '' })
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Tambah Produk
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 space-y-3" encType="multipart/form-data">
          <h2 className="text-lg font-bold">{editProduk ? 'Edit Produk' : 'Tambah Produk'}</h2>
          <input type="text" name="name" placeholder="Nama Produk" value={form.name} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
          <input type="text" name="type" placeholder="Tipe Produk" value={form.type} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          <input type="number" name="harga" placeholder="Harga" value={form.harga} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
          <input type="number" name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
          <textarea name="deskripsi" placeholder="Deskripsi" value={form.deskripsi} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          <input type="file" name="poto" accept="image/*" onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">{editProduk ? 'Update' : 'Simpan'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditProduk(null) }} className="bg-gray-500 text-white px-4 py-2 rounded">Batal</button>
          </div>
        </form>
      )}

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
        {filteredProduk.map((item) => (
          <div key={item.id} className="border rounded p-4 shadow">
            <div className="flex items-start space-x-4">
              {item.poto && <img src={item.poto} className="w-20 h-20 object-cover rounded" />}
              <div className="flex-1 space-y-1">
                <div className="text-base font-semibold">{item.name}</div>
                <div className="text-sm text-gray-600">Tipe: {item.type || '-'}</div>
                <div className="text-sm text-gray-600">Harga: Rp {item.harga?.toLocaleString('id-ID')}</div>
                <div className="text-sm text-gray-600">Stock: {item.stock}</div>
                <div className="text-sm text-gray-600">Deskripsi: {item.deskripsi || '-'}</div>
                <div
                  className={`text-sm font-semibold ${
                    item.verifikasi ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  Verifikasi: {item.verifikasi ? 'Lolos Verifikasi' : 'Belum Lolos Verifikasi'}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => openEdit(item)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">✏️ Edit</button>
              <button onClick={() => handleDelete(item.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">🗑️ Hapus</button>
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
              <th className="p-2 border">Aksi</th>
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
                <td
                  className={`p-2 border text-center font-semibold ${
                    item.verifikasi ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {item.verifikasi ? 'Lolos Verifikasi' : 'Belum Lolos Verifikasi'}
                </td>
                <td className="p-2 border text-center space-x-2">
                  <button onClick={() => openEdit(item)} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">✏️ Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="bg-red-600 text-white px-2 py-1 rounded text-xs">🗑️ Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
