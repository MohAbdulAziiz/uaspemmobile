'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import PelangganLayout from '@/components/pelangganlayout'

export default function ProfilPelangganPage() {
  const { data: session } = useSession()
  const user = session?.user

  const [formData, setFormData] = useState({
    nama: '', email: '', nohp: '', username: '', password: '', alamat: '' // ✅ tambah alamat
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
      alamat: user.alamat || '' // ✅ isi dari session
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
              nama: data.nama || '',
              email: data.email || '',
              nohp: data.nohp || '',
              username: data.username || '',
              password: data.password || '',
              alamat: data.alamat || '' // ✅ isi dari API
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
      nama: formData.nama || user.name,
      email: formData.email || user.email,
      nohp: formData.nohp || user.nohp,
      username: formData.username || user.username,
      password: formData.password || user.password,
      alamat: formData.alamat || user.alamat || '' // ✅
    }

    const form = new FormData()
    form.append('id', user.id)
    form.append('nama', finalData.nama)
    form.append('email', finalData.email)
    form.append('nohp', finalData.nohp)
    form.append('username', finalData.username)
    form.append('password', finalData.password)
    form.append('alamat', finalData.alamat) // ✅
    if (fotoFile) form.append('poto', fotoFile)

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
        alert('Profil diperbarui, tapi session gagal. Silakan login ulang.')
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
        alamat: user.alamat || '' // ✅
      })
    }
  }

  if (!user) return <PelangganLayout><p className="p-6">Loading...</p></PelangganLayout>

  return (
    <PelangganLayout noPadding>
      <br />
      <br />
      <section className="py-16 px-4 sm:px-6 md:px-10 bg-blue-50">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-blue-700 mb-10">
          👤 Profil Pelanggan
        </h1>

        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 sm:p-8">
          {/* === FOTO PROFIL === */}
          <div className="flex flex-col items-center mb-8">
            <img
              src={poto}
              alt="Foto Profil"
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-blue-200 shadow-sm mb-3"
            />
            {isEditMode && (
              <input
                type="file"
                onChange={(e) => setFotoFile(e.target.files[0])}
                className="text-sm text-blue-700"
              />
            )}
            <p className="text-sm text-gray-600 mt-2">Foto Anda</p>
          </div>

          {/* === FORM INPUT === */}
          <div className="space-y-5">
            {['nama', 'email', 'nohp', 'alamat', 'username', 'password'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-blue-700 capitalize mb-1">
                  {field}
                </label>
                <input
                  name={field}
                  type={field === 'password' ? 'password' : 'text'}
                  value={formData[field]}
                  onChange={handleChange}
                  disabled={!isEditMode || field === 'email'}
                  className={`w-full border rounded-lg px-4 py-2 text-blue-800 focus:outline-none focus:ring-2 ${
                    isEditMode
                      ? 'bg-white border-blue-300 focus:ring-blue-300'
                      : 'bg-gray-100 border-gray-100'
                  }`}
                />
              </div>
            ))}

            {/* === VERIFIKASI & ROLE === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Verifikasi Via</label>
                <input
                  value={verifikasiVia}
                  disabled
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Role</label>
                <input
                  value={role}
                  disabled
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-gray-600"
                />
              </div>
            </div>

            {/* === AKSI BUTTON === */}
            <div className="text-right pt-6">
              {isEditMode ? (
                <div className="space-x-2">
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-300 hover:bg-gray-400 text-blue-900 py-2 px-4 rounded-md transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition"
                >
                  Edit Data
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </PelangganLayout>
  )
}
