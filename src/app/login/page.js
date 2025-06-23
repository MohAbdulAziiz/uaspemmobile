'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

// Inisialisasi Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [passwordType, setPasswordType] = useState('password')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const togglePassword = () => {
    setPasswordType((prev) => (prev === 'password' ? 'text' : 'password'))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })

    if (res.ok) {
      // Login sukses, redirect sesuai role
      const sessionRes = await fetch('/api/auth/session')
      const session = await sessionRes.json()
      const role = session?.user?.role

      switch (role) {
        case 'admin':
          router.push('/admin')
          break
        case 'pelanggan':
          router.push('/pelanggan')
          break
        case 'pimpinan':
          router.push('/pimpinan')
          break
        case 'staff gudang':
          router.push('/staff')
          break
        default:
          router.push('/')
      }
    } else {
      // Login gagal, tampilkan error
      setError('Login gagal: Email atau password salah')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4">
      {isClient && (
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
        >
          <source src="/samsung.mp4" type="video/mp4" />
        </video>
      )}

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden w-full max-w-md md:max-w-5xl flex flex-col md:flex-row relative z-10">
        <div
          className="w-full md:w-1/2 relative order-1 md:order-none"
          style={{ backgroundColor: '#010c18' }}
        >
          {isClient && (
            <video
              src="/login.mp4"
              autoPlay
              loop
              muted
              className="w-full h-48 md:h-full object-cover"
            />
          )}
        </div>

        <div className="w-full md:w-1/2 p-6 sm:p-10 bg-gradient-to-r from-[#010c18] to-blue-900 text-white order-2">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold">Selamat datang kembali</h1>
            <h3 className="text-xl text-gray-300 -mt-1">Samsung Store</h3>
            <h1 className="text-2xl font-semibold mt-2">LOGIN</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto">
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-white placeholder-white bg-transparent"
              required
            />

            <div className="relative">
              <input
                type={passwordType}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-white placeholder-white bg-transparent"
                required
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-3 top-3 text-gray-300 text-sm"
              >
                {passwordType === 'password' ? 'Show' : 'Hide'}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
          </form>

          {error && (
            <p className="text-sm text-center mt-4 text-red-300 font-medium">{error}</p>
          )}

          <p className="text-sm text-center mt-6">
            Belum terdaftar?{' '}
            <Link href="/register" className="text-blue-200 font-medium">
              Daftar di sini
            </Link>
          </p>
          <p className="text-sm text-center mt-6">
            <Link href="/" className="text-blue-200 font-medium">
              Kembali
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
