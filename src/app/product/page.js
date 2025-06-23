'use client'

import { useRouter } from 'next/navigation'
import Navbar from '../../components/navbar'
import Footer from '../../components/footer'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function HomePage() {
  const router = useRouter()
  const [kode, setKode] = useState('')
  const [dataPembayaran, setDataPembayaran] = useState(null)
  const [error, setError] = useState('')
  const [produk, setProduk] = useState([])

useEffect(() => {
  const fetchProduk = async () => {
    const { data, error } = await supabase
      .from('produk')
      .select('*')
      .eq('verifikasi', true)

    if (!error && data) setProduk(data)
  }

  fetchProduk()
}, [])

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
{/* === Section: Video Background - Katalog Produk === */}
<section className="relative w-full h-screen">
  {/* Background Video */}
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
  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-blue-900/70 to-black/90 z-10" />

  {/* Konten utama */}
  <div className="relative z-20 flex items-center justify-center h-full px-6 md:px-20">
    <div className="text-white text-center max-w-2xl">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
        🔥 Temukan Katalog HP Samsung Terbaik
      </h1>
      <p className="text-lg md:text-xl mb-6">
        Jelajahi berbagai pilihan produk Samsung terbaru dengan fitur canggih dan harga terbaik. Belanja sekarang dan dapatkan penawaran eksklusif!
      </p>
      <button
        onClick={() => {
          const section = document.getElementById('katalog') // pastikan nanti section katalog punya id='katalog'
          if (section) {
            section.scrollIntoView({ behavior: 'smooth' })
          }
        }}
         className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-blue-800 transition duration-300"
      >
        🛒 Lihat Katalog
      </button>
    </div>
  </div>
</section>

{/* === Section: Katalog Produk === */}
<section id="katalog" className="bg-white py-16 px-4 sm:px-6 md:px-12 lg:px-20">
  <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">🛍️ Katalog Produk Samsung</h2>

  {['Smartphone', 'Laptop', 'Tablet', 'Wearable'].map((kategori) => {
    const produkPerKategori = produk.filter((item) => item.type === kategori)

    if (produkPerKategori.length === 0) return null

    return (
      <div key={kategori} className="mb-16">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">{kategori}</h3>

        <Swiper
          spaceBetween={20}
          slidesPerView={1.1}
          breakpoints={{
            640: { slidesPerView: 1.3 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {produkPerKategori.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="bg-white rounded-2xl shadow-md border hover:shadow-lg transition duration-300 overflow-hidden flex flex-col h-full">
                <img
                  src={item.poto}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">{item.deskripsi}</p>
                    <div className="mt-2 text-blue-700 font-semibold">Rp {item.harga.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Stok: {item.stock}</div>
                  </div>
                  <button
                    onClick={() => router.push('/login')}
                    className="mt-4 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm w-full"
                  >
                    🛒 Beli Sekarang
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    )
  })}
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