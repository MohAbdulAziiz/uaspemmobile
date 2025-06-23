'use client'

import { useRouter } from 'next/navigation'
import Navbar from '../../components/navbar'
import Footer from '../../components/footer'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
)

export default function HomePage() {
  const router = useRouter()
  const [kode, setKode] = useState('')
  const [dataPembayaran, setDataPembayaran] = useState(null)
  const [error, setError] = useState('')

  const handleTracking = async () => {
    setError('')
    const { data, error } = await supabase
      .from('pembayaran')
      .select('*')
      .eq('kode', kode)
      .single()

    if (error || !data) {
      setDataPembayaran(null)
      setError('Kode tidak ditemukan. Pastikan kode yang Anda masukkan benar.')
    } else {
      setDataPembayaran(data)
    }
  }

  const [reviews, setReviews] = useState([])

useEffect(() => {
  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('review')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setReviews(data)
  }

  fetchReviews()
}, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

{/* === Section: Video Background Tracking Paket === */}
<section className="relative w-full h-screen">
  <video
    className="absolute top-0 left-0 w-full h-full object-cover z-0"
    autoPlay
    muted
    loop
    playsInline
  >
    <source src="/samsung.mp4" type="video/mp4" />
    Browser Anda tidak mendukung tag video.
  </video>

  {/* Overlay gradient */}
  <div className="absolute inset-0 bg-gradient-to-r from-black via-blue-900 to-black opacity-70 z-10" />

  {/* Content */}
  <div className="relative z-20 flex items-center justify-center h-full px-6 md:px-20">
    <div className="text-white text-center max-w-2xl">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
        📦 Lacak Pengiriman Anda
      </h1>
      <p className="text-lg md:text-xl mb-6">
        Masukkan kode pembayaran Anda dan pantau status pesanan secara real-time. Mudah, cepat, dan terpercaya.
      </p>
      <button
        onClick={() => {
          const section = document.getElementById('tracking')
          if (section) {
            section.scrollIntoView({ behavior: 'smooth' })
          }
        }}
        className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-blue-800 transition duration-300"
      >
        🔍 Cek Status Sekarang
      </button>
    </div>
  </div>
</section>

{/* === Section: Tracking Pengiriman === */}
<section id= "tracking" className="bg-white py-12 px-4 sm:px-6 md:px-12 lg:px-20">
  <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-800 mb-6">
    📦 Cek Status Pengiriman
  </h2>

  {/* Form Input Kode */}
  <div className="w-full max-w-md mx-auto text-center mb-6">
    <input
      type="text"
      placeholder="Masukkan kode pembayaran..."
      value={kode}
      onChange={(e) => setKode(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      onClick={handleTracking}
      className="bg-blue-800 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm sm:text-base transition duration-300"
    >
      Cek Status
    </button>
    {error && <p className="text-red-600 mt-3 text-sm">{error}</p>}
  </div>

  {/* Detail Pengiriman */}
  {dataPembayaran && (
    <div className="w-full max-w-2xl mx-auto bg-gray-50 rounded-xl shadow-md p-4 sm:p-6 border">
      <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-4">📄 Detail Pengiriman</h3>
      <ul className="space-y-2 text-left text-sm sm:text-base">
        <li><strong>Kode:</strong> {dataPembayaran.kode}</li>
        <li><strong>Nama:</strong> {dataPembayaran.nama}</li>
        <li><strong>Email:</strong> {dataPembayaran.email}</li>
        <li><strong>No HP:</strong> {dataPembayaran.nohp}</li>
        <li><strong>Alamat:</strong> {dataPembayaran.alamat}</li>
        <li>
          <strong>Status:</strong>{' '}
          <span className={`font-semibold ${
            dataPembayaran.status === 'Dikirim'
              ? 'text-green-600'
              : dataPembayaran.status === 'Sedang Diproses'
              ? 'text-orange-500'
              : 'text-gray-600'
          }`}>
            {dataPembayaran.status}
          </span>
        </li>
        {dataPembayaran.poto && (
          <li className="mt-4">
            <strong>Bukti Pembayaran:</strong>
            <br />
            <img
              src={dataPembayaran.poto}
              alt="Bukti Pembayaran"
              className="w-full sm:w-64 max-w-full mt-2 rounded-lg border"
            />
          </li>
        )}
      </ul>
    </div>
  )}
</section>

{/* === Section: Lihat Review === */}
<section className="bg-gray-100 py-12 px-4 sm:px-6 md:px-12 lg:px-20">
  <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-800 mb-8">
    💬 Review Pelanggan
  </h2>

  {/* Form Review */}
  <div className="max-w-xl mx-auto text-center mb-10">
    <p className="mb-4 text-sm text-gray-700">Ingin memberikan review? Login terlebih dahulu.</p>
    <button
      onClick={() => router.push('/login')}
      className="bg-blue-800 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm sm:text-base transition duration-300"
    >
      ✍️ Tambahkan Review
    </button>
  </div>

  {/* Daftar Review */}
  <div className="max-w-3xl mx-auto space-y-6">
    {reviews.length > 0 ? (
      reviews.map((item, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow border">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-blue-700">{item.nama}</h4>
            <span className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</span>
          </div>
          <p className="text-gray-800 mb-2">{item.pesan}</p>
          <p className="text-yellow-500 text-sm">⭐ {item.ratings} / 5</p>
        </div>
      ))
    ) : (
      <p className="text-center text-gray-500">Belum ada review yang ditampilkan.</p>
    )}
  </div>
</section>


      <Footer />
    </div>
  )
}
