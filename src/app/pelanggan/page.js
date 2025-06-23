'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { createClient } from '@supabase/supabase-js'
import PelangganLayout from '@/components/pelangganlayout'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function PelangganPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [produkData, setProdukData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProduk, setFilteredProduk] = useState([])
  const [selectedProduk, setSelectedProduk] = useState(null)
  const closeModal = () => setSelectedProduk(null)

  // --- Review Section State ---
  const [nama, setNama] = useState(session?.user?.name || 'Anomali')
  const [pesan, setPesan] = useState('')
  const [ratings, setRatings] = useState(5)
  const [allReviews, setAllReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
)
  // Filter Produk
  useEffect(() => {
    const filtered = produkData.filter((produk) => {
      const query = searchQuery.toLowerCase()
      return (
        produk.name?.toLowerCase().includes(query) ||
        produk.deskripsi?.toLowerCase().includes(query) ||
        produk.type?.toLowerCase().includes(query)
      )
    })
    setFilteredProduk(filtered)
  }, [searchQuery, produkData])

  // Cek Auth dan Role
  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') return router.replace('/login')
    if (session?.user?.role?.toLowerCase() !== 'pelanggan') return router.replace('/')
  }, [session, status, router])

  // Ambil data produk
  useEffect(() => {
    const fetchProduk = async () => {
      const { data, error } = await supabase
        .from('produk')
        .select('name, type, harga, deskripsi, stock, poto')

      if (!error) setProdukData(data)
    }
    fetchProduk()
  }, [])

  // Ambil review
  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('review')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error) {
        setAllReviews(data)
        const avg = data.reduce((sum, r) => sum + r.ratings, 0) / data.length || 0
        setAverageRating(avg)
      }
    }
    fetchReviews()
  }, [])

  const handleSubmitReview = async () => {
    if (!pesan || !ratings) return alert('Isi semua kolom!')
    const { error } = await supabase.from('review').insert([
      { nama, pesan, ratings }
    ])
    if (!error) {
      alert('Review berhasil dikirim!')
      setPesan('')
      setRatings(5)
      setNama(session?.user?.name || 'Anomali')
      const { data } = await supabase
        .from('review')
        .select('*')
        .order('created_at', { ascending: false })
      setAllReviews(data)
      const avg = data.reduce((sum, r) => sum + r.ratings, 0) / data.length || 0
      setAverageRating(avg)
    } else {
      alert('Gagal kirim review: ' + error.message)
    }
  }

  if (status === 'loading' || !session) {
    return <p className="p-6">Loading...</p>
  }

  return (
    <PelangganLayout noPadding>
      <section id="home" className="relative w-full h-screen overflow-hidden m-0 p-0">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/samsung.mp4" type="video/mp4" />
          Browser Anda tidak mendukung tag video.
        </video>

        <div className="absolute inset-0 bg-gradient-to-r from-black via-blue-900 to-black opacity-70 z-10" />

        <div className="relative z-20 flex flex-col md:flex-row items-center justify-between h-full px-6 md:px-20">
          <div className="text-white text-left md:w-1/2 w-full mb-10 md:mb-0 flex flex-col justify-center h-full">
            <div className="max-w-xl">
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
                Selamat Datang {session?.user?.name}
              </h1>
              <p className="text-2xl font-semibold drop-shadow-md">
                Selamat Berbelanja
              </p>
            </div>
          </div>
        </div>
      </section>


{/* === Section: Produk Terbaru === */}
<section id="produk" className="py-16 px-4 sm:px-6 md:px-20 bg-white relative">
  <h2 className="text-4xl font-extrabold text-center text-blue-900 mb-12 tracking-tight">
    🆕 Produk Terbaru
  </h2>

  {["Smartphone", "Tablet", "Wearable", "Laptop"].map((type) => (
    <div key={type} className="mb-16">
      <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b border-blue-100 pb-2">
        📱 {type}
      </h3>

      <Swiper
        modules={[Autoplay, Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        navigation={true}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        className="z-10"
      >
        {produkData
          .filter((p) => p.type === type)
          .map((produk, index) => (
            <SwiperSlide key={index}>
              <div
                onClick={() => setSelectedProduk(produk)}
                className="relative bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col h-full cursor-pointer"
              >
                {/* Gambar Produk */}
                <img
                  src={produk.poto}
                  alt={produk.name}
                  className="w-full h-48 object-cover rounded-t-2xl"
                />

                {/* Detail */}
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <h4 className="text-lg font-bold text-blue-800 mb-1">{produk.name}</h4>
                    <p className="text-sm text-gray-600 truncate">{produk.deskripsi}</p>
                    <p className="text-blue-700 font-semibold mt-2">
                      Rp {produk.harga.toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-gray-500">Stok: {produk.stock}</p>
                  </div>

                  {/* Tombol Beli Sekarang */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation() // cegah buka modal detail
                      setCheckoutProduk(produk)
                      setJumlahBeli(1)
                    }}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-xl transition duration-300"
                  >
                    Beli Sekarang
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  ))}

  {/* Efek Blur Background */}
  <div className="absolute -top-32 -left-20 w-[300px] h-[300px] bg-blue-100 rounded-full blur-3xl opacity-40 animate-pulse hidden md:block" />
  <div className="absolute -bottom-32 -right-20 w-[300px] h-[300px] bg-indigo-100 rounded-full blur-3xl opacity-40 animate-pulse hidden md:block" />
</section>


{/* === Section: Video Promosi === */}
<section id="video" className="py-12 px-4 sm:px-6 md:px-20 bg-gray-100">
  <h2 className="text-3xl font-bold text-center mb-10">Video Promosi Samsung</h2>

  <div className="w-full aspect-video mb-12">
    <iframe
      className="w-full h-full rounded-xl shadow"
      src="https://www.youtube.com/embed/VAwbDMLrx10?rel=0"
      title="Video Utama"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  </div>

  <Swiper
    modules={[Autoplay, Navigation]}
    spaceBetween={20}
    slidesPerView={1}
    loop={true}
    autoplay={{ delay: 2000, disableOnInteraction: false }}
    navigation={true}
    breakpoints={{
      640: { slidesPerView: 2 },
      768: { slidesPerView: 3 },
      1024: { slidesPerView: 4 },
    }}
  >
    {[
      "https://youtu.be/vjbK9B9WmPE",
      "https://youtu.be/rwxposMAV-w",
      "https://youtu.be/1vMjTGbLDRc",
      "https://youtu.be/Ya2Syb5XN3g",
      "https://youtu.be/jxZiK7DCAhk",
      "https://youtu.be/wVfCpGsGmpM",
      "https://youtu.be/gSIdGUgT9o4",
      "https://youtu.be/_Cf_Thff044",
      "https://youtu.be/6w8gjsfRJB4",
      "https://youtu.be/6yPjrvk72Ao",
    ].map((url, index) => {
      const videoId = new URL(url).pathname.split('/')[1]
      return (
        <SwiperSlide key={index}>
          <div className="w-full aspect-video rounded-xl overflow-hidden shadow-md">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?rel=0`}
              title={`Video ${index + 1}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </SwiperSlide>
      )
    })}
  </Swiper>
</section>
{/* === Section: Ulasan / Review Produk dan Web === */}
<section id="review" className="py-16 px-4 sm:px-6 md:px-20 bg-white">
  <h2 className="text-3xl font-bold text-center text-blue-900 mb-10">📝 Ulasan Pengguna</h2>

  {/* === Form Review === */}
  <div className="max-w-3xl mx-auto bg-gray-50 p-6 rounded-xl shadow mb-12">
    <h3 className="text-xl font-semibold mb-4">Tinggalkan Review Anda</h3>

    {/* Pilihan Nama */}
    <div className="flex items-center mb-4">
      <label className="mr-4 font-medium">Nama:</label>
      <select
        className="border rounded px-3 py-2"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
      >
        <option value={session?.user?.name}>{session?.user?.name}</option>
        <option value="Anomali">Anomali</option>
      </select>
    </div>

    {/* Pesan */}
    <textarea
      className="w-full border rounded p-3 mb-4"
      rows="4"
      placeholder="Tulis pesan review Anda..."
      value={pesan}
      onChange={(e) => setPesan(e.target.value)}
    />

    {/* Bintang Rating */}
    <div className="flex items-center mb-4">
      <label className="mr-4 font-medium">Rating:</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-3xl cursor-pointer transition-transform hover:scale-125 ${
              star <= ratings ? 'text-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => setRatings(star)}
          >
            ★
          </span>
        ))}
      </div>
    </div>

    {/* Tombol Kirim */}
    <button
      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      onClick={handleSubmitReview}
    >
      Kirim Review
    </button>
  </div>

  {/* === Review Display === */}
  <div className="max-w-5xl mx-auto">
    <h3 className="text-xl font-semibold mb-6">Review Pengguna Lainnya</h3>

    {/* Rata-rata Rating */}
    <p className="mb-4 text-yellow-500 text-lg font-bold">
      ⭐ Rata-rata: {averageRating.toFixed(1)} / 5
    </p>

    {/* Daftar Review */}
    {allReviews.length === 0 ? (
      <p className="text-gray-500">Belum ada review.</p>
    ) : (
      allReviews.map((r, i) => (
        <div key={i} className="bg-gray-100 p-4 rounded-xl mb-4 shadow">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-blue-800">{r.nama}</span>
            <span className="text-yellow-500">{"★".repeat(r.ratings)}</span>
          </div>
          <p className="mb-2">{r.pesan}</p>
          <p className="text-sm text-gray-500">{new Date(r.created_at).toLocaleString()}</p>
        </div>
      ))
    )}
  </div>
</section>
    </PelangganLayout>
  )
}
