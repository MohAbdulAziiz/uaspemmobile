'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import AdminLayout from '@/components/adminlayout'

export default function ProfilePage() {
  const { data: session } = useSession()
  const user = session?.user

  const [formData, setFormData] = useState({
    nama: '', email: '', nohp: '', username: '', password: '', alamat: ''
  })
  const [fotoFile, setFotoFile] = useState(null)
  const [verifikasiVia, setVerifikasiVia] = useState('-')
  const [role, setRole] = useState('-')
  const [poto, setPoto] = useState('/default-user.png')
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    if (!user?.id) return

    const defaultData = {
      nama: user.name || '',
      email: user.email || '',
      nohp: user.nohp || '',
      username: user.username || '',
      password: user.password || '',
      alamat: user.alamat || '',
    }

    setFormData(defaultData)
    setVerifikasiVia(user.verifikasi_via || '-')
    setRole(user.role || '-')
    setPoto(user.poto || '/default-user.png')

    if (!user.username || !user.password) {
      fetch(`/api/profile?email=${user.email}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setFormData({
              nama: data.nama || defaultData.nama,
              email: data.email || defaultData.email,
              nohp: data.nohp || defaultData.nohp,
              username: data.username || '',
              password: data.password || '',
              alamat: data.alamat || '',
            })
            setVerifikasiVia(data.verifikasi_via || '-')
            setRole(data.role || '-')
            setPoto(data.poto || '/default-user.png')
          }
        })
        .catch(console.error)
    }
  }, [user])

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    if (!user?.id) return

    const finalData = {
      nama: formData.nama || user.name || '',
      email: formData.email || user.email || '',
      nohp: formData.nohp || user.nohp || '',
      username: formData.username || user.username || '',
      password: formData.password || user.password || '',
      alamat: formData.alamat || user.alamat || '',
    }

    const form = new FormData()
    form.append('id', user.id)
    form.append('nama', finalData.nama)
    form.append('email', finalData.email)
    form.append('nohp', finalData.nohp)
    form.append('username', finalData.username)
    form.append('password', finalData.password)
    form.append('alamat', finalData.alamat)
    if (fotoFile) form.append('foto', fotoFile)

    const res = await fetch('/api/profile', {
      method: 'PUT',
      body: form,
    })

    if (res.ok) {
      const result = await signIn('credentials', {
        redirect: false,
        email: finalData.email,
        password: finalData.password,
      })

      if (result.error) {
        alert('Data berhasil diubah, tapi gagal memperbarui session. Silakan login ulang.')
      } else {
        alert('Profil berhasil diperbarui.')
        setIsEditMode(false)
        setFotoFile(null)
      }
    } else {
      alert('Gagal menyimpan perubahan.')
    }
  }

  const cancelEdit = () => {
    setIsEditMode(false)
    setFotoFile(null)
    if (user) {
      setFormData({
        nama: user.name || '',
        email: user.email || '',
        nohp: user.nohp || '',
        username: user.username || '',
        password: user.password || '',
        alamat: user.alamat || '',
      })
    }
  }

  if (!user) return <AdminLayout><p>Loading...</p></AdminLayout>

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Profil Staff Gudang</h1>
      <div className="bg-white rounded shadow p-6 flex gap-6">
        <div className="flex flex-col items-center w-28">
          <img
            src={poto}
            className="w-28 h-28 rounded-full object-cover mb-2"
            alt="Foto"
          />
          {isEditMode && (
            <input
              type="file"
              onChange={(e) => setFotoFile(e.target.files[0])}
              className="text-sm"
            />
          )}
        </div>

        <div className="flex-1 space-y-4">
          {['nama', 'email', 'nohp', 'username', 'password', 'alamat'].map(field => (
            <div key={field}>
              <label className="block text-sm mb-1 capitalize">{field}</label>
              <input
                name={field}
                type={field === 'password' ? 'password' : 'text'}
                value={formData[field]}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                disabled={!isEditMode}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm mb-1">Verifikasi Via</label>
            <input
              type="text"
              value={verifikasiVia}
              className="w-full border px-3 py-2 rounded bg-gray-100"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Role</label>
            <input
              type="text"
              value={role}
              className="w-full border px-3 py-2 rounded bg-gray-100"
              disabled
            />
          </div>

          <div className="text-right space-x-2">
            {isEditMode && (
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Batal
              </button>
            )}
            <button
              onClick={() => isEditMode ? handleSubmit() : setIsEditMode(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {isEditMode ? 'Simpan' : 'Edit Data'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
