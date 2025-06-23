"use client"

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/adminlayout'
import { useSession } from 'next-auth/react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState({
    nama: '', username: '', email: '', nohp: '', password: '', role: '', verifikasi_via: '', verifikasi: false, poto: null, fotoLama: ''
  })
  const [search, setSearch] = useState('')
const [limit, setLimit] = useState(10)
const [filteredUsers, setFilteredUsers] = useState([])
useEffect(() => {
  const filtered = users.filter(user =>
    user.nama.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.username.toLowerCase().includes(search.toLowerCase())
  )
  setFilteredUsers(filtered.slice(0, limit))
}, [users, search, limit])


  useEffect(() => {
    refreshData()
  }, [])

  const refreshData = async () => {
    const res = await fetch('/api/user')
    const data = await res.json()
    setUsers(data)
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
    formData.append('nama', form.nama)
    formData.append('username', form.username)
    formData.append('email', form.email)
    formData.append('nohp', form.nohp)
    formData.append('password', form.password)
    formData.append('role', form.role)
    formData.append('verifikasi_via', form.verifikasi_via)
    formData.append('verifikasi', form.verifikasi.toString())

    if (form.poto) {
      formData.append('poto', form.poto)
    } else if (form.fotoLama) {
      formData.append('fotoLama', form.fotoLama)
    }

    const method = editUser ? 'PUT' : 'POST'
    if (editUser) formData.append('id', editUser.id)

    await fetch('/api/user', {
      method,
      body: formData
    })

    setForm({ nama: '', username: '', email: '', nohp: '', password: '', role: '', verifikasi_via: '', verifikasi: false, poto: null, fotoLama: '' })
    setEditUser(null)
    setShowForm(false)
    refreshData()
  }

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus user ini?')) {
      await fetch(`/api/user?id=${id}`, { method: 'DELETE' })
      refreshData()
    }
  }

  const openEdit = (user) => {
    setEditUser(user)
    setForm({
      nama: user.nama,
      username: user.username,
      email: user.email,
      nohp: user.nohp,
      password: user.password,
      role: user.role || '',
      verifikasi_via: user.verifikasi_via || '',
      verifikasi: user.verifikasi || false,
      poto: null,
      fotoLama: user.poto || ''
    })
    setShowForm(true)
  }

  const handleInlineUpdate = async (id, field, value) => {
    await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, [field]: value }),
    })
    refreshData()
  }

  if (status === 'loading') return <p className="p-6">Loading...</p>
  if (!session || session?.user?.role?.toLowerCase() !== 'admin') return null

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
        <button
          onClick={() => {
            setForm({ nama: '', username: '', email: '', nohp: '', password: '', role: '', verifikasi_via: '', verifikasi: false, poto: null })
            setEditUser(null)
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Tambah Data
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 space-y-3" encType="multipart/form-data">
          <h2 className="text-lg font-bold mb-2">{editUser ? 'Edit User' : 'Tambah User'}</h2>
          <input type="text" name="nama" placeholder="Nama" value={form.nama} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
          <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
          <input type="nohp" name="nohp" placeholder="nohp" value={form.nohp} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
          <input type="text" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
          <input
            type="file"
            name="poto"
            accept="image/*"
            onChange={(e) => setForm(prev => ({ ...prev, poto: e.target.files[0] }))}
            className="w-full border px-3 py-2 rounded"
          />

          <select name="verifikasi_via" value={form.verifikasi_via} onChange={handleChange} className="w-full border px-3 py-2 rounded">
            <option value="">Verifikasi Via</option>
            <option value="admin">Admin</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>

          <select name="verifikasi" value={form.verifikasi.toString()} onChange={(e) => setForm(prev => ({ ...prev, verifikasi: e.target.value === 'true' }))} className="w-full border px-3 py-2 rounded">
            <option value="false">Belum Verifikasi</option>
            <option value="true">Terverifikasi</option>
          </select>

          <select name="role" value={form.role} onChange={handleChange} className="w-full border px-3 py-2 rounded">
            <option value="">Pilih Role</option>
            <option value="admin">Admin</option>
            <option value="pelanggan">Pelanggan</option>
            <option value="staff gudang">Staff Gudang</option>
            <option value="pimpinan">Pimpinan</option>
          </select>

          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">{editUser ? 'Update' : 'Simpan'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditUser(null) }} className="bg-gray-500 text-white px-4 py-2 rounded">Batal</button>
          </div>
        </form>
      )}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <input
          type="text"
          placeholder="Cari nama/email/username"
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
      <div className="overflow-x-auto">
        <table className="w-full border text-sm hidden md:table">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-2 border">No</th>
              <th className="p-2 border">Nama</th>
              <th className="p-2 border">Username</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">No HP</th>
              <th className="p-2 border">Password</th>
              <th className="p-2 border">Foto</th>
              <th className="p-2 border">Verifikasi Via</th>
              <th className="p-2 border">Verifikasi</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="10" className="p-4 text-center">Tidak ada data</td></tr>
            ) : (
              filteredUsers.map((user, i) => (
                <tr key={user.id} className="hover:bg-gray-100">
                  <td className="p-2 border text-center">{i + 1}</td>
                  <td className="p-2 border">{user.nama}</td>
                  <td className="p-2 border">{user.username}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border">{user.nohp}</td>
                  <td className="p-2 border">{user.password}</td>
                  <td className="p-2 border">{user.poto ? <img src={user.poto} alt="foto" className="w-10 h-10 object-cover rounded-full mx-auto" /> : '-'}</td>
                  <td className="p-2 border">
                    <select
                      value={user.verifikasi_via || ''}
                      onChange={(e) => handleInlineUpdate(user.id, 'verifikasi_via', e.target.value)}
                      className="border px-1 py-0.5 text-sm"
                    >
                      <option value="">-</option>
                      <option value="admin">Admin</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Email</option>
                    </select>
                  </td>
                  <td className="p-2 border">
                    <select
                      value={user.verifikasi ? 'true' : 'false'}
                      onChange={(e) => handleInlineUpdate(user.id, 'verifikasi', e.target.value === 'true')}
                      className="border px-1 py-0.5 text-sm"
                    >
                      <option value="true">Terverifikasi</option>
                      <option value="false">Belum Verifikasi</option>
                    </select>
                  </td>
                  <td className="p-2 border">
                    <select
                      value={user.role?.trim().toLowerCase() || ''}
                      onChange={(e) => handleInlineUpdate(user.id, 'role', e.target.value)}
                      className="border px-1 py-0.5 text-sm"
                    >
                      <option value="">-</option>
                      <option value="admin">Admin</option>
                      <option value="pelanggan">Pelanggan</option>
                      <option value="staff gudang">Staff Gudang</option>
                      <option value="pimpinan">Pimpinan</option>
                    </select>
                  </td>
                  <td className="p-2 border text-center space-x-2">
                    <button onClick={() => openEdit(user)} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">✏️ Edit</button>
                    <button onClick={() => handleDelete(user.id)} className="bg-red-600 text-white px-2 py-1 rounded text-xs">🗑️ Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Mobile View */}
        <div className="md:hidden grid gap-4">
          {filteredUsers.map((user, i) => (
            <div key={user.id} className="border p-4 rounded shadow">
              <p><strong>Nama:</strong> {user.nama}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>No HP:</strong> {user.nohp}</p>
              <p><strong>Password:</strong> {user.password}</p>
              <p><strong>Foto:</strong> {user.poto ? <img src={user.poto} className="w-20 h-20 object-cover rounded-full" /> : '-'}</p>

              <div className="mt-2 space-y-1">
                <label className="block">Verifikasi Via:
                  <select value={user.verifikasi_via || ''} onChange={(e) => handleInlineUpdate(user.id, 'verifikasi_via', e.target.value)} className="w-full border px-2 py-1 rounded">
                    <option value="">-</option>
                    <option value="admin">Admin</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                  </select>
                </label>
                <label className="block">Verifikasi:
                  <select value={user.verifikasi ? 'true' : 'false'} onChange={(e) => handleInlineUpdate(user.id, 'verifikasi', e.target.value === 'true')} className="w-full border px-2 py-1 rounded">
                    <option value="false">Belum Verifikasi</option>
                    <option value="true">Terverifikasi</option>
                  </select>
                </label>
                <label className="block">Role:
                    <select
                      value={user.role?.trim().toLowerCase() || ''}
                      onChange={(e) => handleInlineUpdate(user.id, 'role', e.target.value)}
                      className="border px-1 py-0.5 text-sm"
                    >
                      <option value="">-</option>
                      <option value="admin">Admin</option>
                      <option value="pelanggan">Pelanggan</option>
                      <option value="staff gudang">Staff Gudang</option>
                      <option value="pimpinan">Pimpinan</option>
                    </select>
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => openEdit(user)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                <button onClick={() => handleDelete(user.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}