'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const router = useRouter()
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [nohp, setNohp] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [verifikasi_via, setVerifikasiVia] = useState('email')
  const [verifikasi_code, setVerifikasiCode] = useState('')
  const [pesan, setPesan] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setPesan('')

    if (!nama || !email || !nohp || !username || !password || !verifikasi_via) {
      setPesan('Semua field wajib diisi.')
      return
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, email, nohp, username, password, verifikasi_via }),
      })

      const data = await res.json()

      if (res.ok) {
        setPesan('Registrasi berhasil. Masukkan kode verifikasi yang dikirim.')
        setIsRegistered(true)
      } else {
        setPesan(data.message || 'Registrasi gagal. Silakan coba lagi.')
      }
    } catch (err) {
      console.error('Register error:', err)
      setPesan('Terjadi kesalahan koneksi. Silakan coba beberapa saat lagi.')
    }
  }

  const handleVerifikasi = async (e) => {
    e.preventDefault()
    setPesan('')

    if (!verifikasi_code) {
      setPesan('Silakan masukkan kode verifikasi.')
      return
    }

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nohp, kode: verifikasi_code }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Verifikasi berhasil! Silakan login.')
        router.push('/login')
      } else {
        setPesan(data.message || 'Verifikasi gagal. Coba lagi.')
      }
    } catch (err) {
      console.error('Verify error:', err)
      setPesan('Gagal menghubungi server.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isRegistered ? 'Verifikasi Akun' : 'Daftar Akun'}
        </h2>

        {pesan && <p className="text-red-500 text-sm text-center mb-4">{pesan}</p>}

        {!isRegistered ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <input type="text" placeholder="Nama Lengkap" value={nama} onChange={(e) => setNama(e.target.value)} className="w-full border px-3 py-2 rounded" required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border px-3 py-2 rounded" required />
            <select value={verifikasi_via} onChange={(e) => setVerifikasiVia(e.target.value)} className="w-full border px-3 py-2 rounded">
              <option value="email">Verifikasi via Email</option>
              <option value="whatsapp">Verifikasi via WhatsApp</option>
            </select>
            <input type="text" placeholder="No HP / WhatsApp" value={nohp} onChange={(e) => setNohp(e.target.value)} className="w-full border px-3 py-2 rounded" required />
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border px-3 py-2 rounded" required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border px-3 py-2 rounded" required />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Register</button>
          </form>
        ) : (
          <form onSubmit={handleVerifikasi} className="space-y-4">
            <input
              type="text"
              placeholder="Masukkan Kode Verifikasi"
              value={verifikasi_code}
              onChange={(e) => setVerifikasiCode(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              Verifikasi Akun
            </button>
          </form>
        )}

        {!isRegistered && (
          <p className="text-center text-sm mt-4">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Masuk di sini
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
