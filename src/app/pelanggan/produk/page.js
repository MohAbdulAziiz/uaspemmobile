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
  const [checkoutProduk, setCheckoutProduk] = useState(null)
  const [jumlahBeli, setJumlahBeli] = useState(1)

  const closeModal = () => setSelectedProduk(null)
  const closeCheckoutModal = () => {
    setCheckoutProduk(null)
    setJumlahBeli(1)
  }

  // 🔐 Cek role dan redirect jika tidak sesuai
  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') return router.replace('/login')
    if (session?.user?.role?.toLowerCase() !== 'pelanggan') return router.replace('/')
  }, [session, status, router])

  // 🛒 Ambil data produk hanya yang sudah diverifikasi
  useEffect(() => {
    const fetchProduk = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      const { data, error } = await supabase
        .from('produk')
        .select('name, type, harga, deskripsi, stock, poto, verifikasi')

      if (error) {
        console.error('Gagal fetch produk:', error.message)
      } else {
        const produkTerverifikasi = data.filter(
          (p) =>
            p.verifikasi === true ||
            p.verifikasi === 'true' ||
            p.verifikasi === 'Lolos Verifikasi'
        )
        setProdukData(produkTerverifikasi)
      }
    }

    fetchProduk()
  }, [])

  // 🔍 Filter pencarian berdasarkan keyword + verifikasi
  useEffect(() => {
    const query = searchQuery.toLowerCase()
    const filtered = produkData.filter(
      (produk) =>
        (produk.name?.toLowerCase().includes(query) ||
          produk.deskripsi?.toLowerCase().includes(query) ||
          produk.type?.toLowerCase().includes(query)) &&
        (produk.verifikasi === true ||
          produk.verifikasi === 'true' ||
          produk.verifikasi === 'Lolos Verifikasi')
    )
    setFilteredProduk(filtered)
  }, [searchQuery, produkData])

  // ⏳ Tampilkan loading saat status masih loading
  if (status === 'loading' || !session) {
    return <p className="p-6">Loading...</p>
  }


const handleSimpanKeKeranjang = async () => {
  if (!session) {
    alert('Anda harus login untuk menyimpan ke keranjang.')
    return
  }

  const email = session.user.email
  const nohp = session.user.nohp || '' // Opsional
  const { name, harga, poto } = checkoutProduk

  const res = await fetch('/api/keranjang', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      nohp,
      name,
      harga,
      jumlah: jumlahBeli,
      poto, // Tambahkan poto
    })
  })

  const data = await res.json()

  if (!res.ok) {
    alert(`Gagal menyimpan ke keranjang: ${data.error}`)
    return
  }

  router.push('/pelanggan/keranjang')
}

  return (
    <PelangganLayout noPadding>
<section id="home" className="relative w-full h-screen overflow-hidden m-0 p-0">
  {/* Background Video */}
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

  {/* Overlay Transparan */}
  <div className="absolute inset-0 bg-gradient-to-r from-black via-blue-900 to-black opacity-70 z-10" />

  {/* Konten Tengah */}
  <div className="relative z-20 flex items-center justify-center h-full px-6 text-center">
    <div className="text-white max-w-2xl">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
        Jelajahi Produk Terbaru
      </h1>
      <p className="text-2xl font-semibold drop-shadow-md">
        Temukan HP Samsung Impianmu
      </p>
    </div>
  </div>
</section>

{/* === Section: Pencarian Produk === */}
<section className="py-16 px-4 sm:px-6 md:px-10 bg-blue-50">
  <h2 className="text-3xl font-bold text-center text-blue-900 mb-8">🔍 Cari Produk</h2>

  {/* Input Search */}
  <div className="max-w-2xl mx-auto mb-10">
    <div className="relative">
      <input
        type="text"
        placeholder="Cari nama, tipe, atau deskripsi produk..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-12 pr-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm text-gray-800"
      />
      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2a7.5 7.5 0 010 15z" />
        </svg>
      </span>
    </div>
  </div>

  {/* Produk Grid */}
  <div className="w-full flex justify-center">
    <div className="w-full max-w-screen-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2">
      {(searchQuery.trim() === ''
        ? produkData.slice(0, 8)
        : filteredProduk
      ).map((produk, index) => (
        <div
          key={index}
          onClick={() => setSelectedProduk(produk)}
          className="cursor-pointer bg-white border border-blue-200 rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col"
        >
          <img
            src={produk.poto}
            alt={produk.name}
            className="w-full h-44 object-cover rounded-t-2xl"
          />
          <div className="p-4 flex flex-col justify-between flex-grow">
            <div>
              <h4 className="text-lg font-bold text-blue-800 mb-1">{produk.name}</h4>
              <p className="text-sm text-gray-600 truncate">{produk.deskripsi}</p>
              <p className="text-blue-700 font-semibold mt-2">
                Rp {produk.harga.toLocaleString('id-ID')}
              </p>
              <p className="text-sm text-gray-500">Stok: {produk.stock}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setCheckoutProduk(produk)
                setJumlahBeli(1)
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-xl transition duration-300"
            >
              Beli Sekarang
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>

  {searchQuery && filteredProduk.length === 0 && (
    <p className="text-center text-gray-500 text-sm mt-6">Tidak ada produk yang cocok dengan pencarian.</p>
  )}
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

{/* === Popup Detail Produk === */}
{selectedProduk && (
  <div className="fixed inset-0 flex items-center justify-center z-[9999]">
    <div className="bg-white w-[90%] md:w-[600px] rounded-lg shadow-lg p-6 relative animate-fadeIn">
      <button
        onClick={closeModal}
        className="absolute top-3 right-3 text-gray-700 hover:text-red-600 text-xl font-bold"
        aria-label="Tutup"
      >
        ×
      </button>
      <img
        src={selectedProduk.poto}
        alt={selectedProduk.name}
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedProduk.name}</h3>
      <p className="text-sm text-gray-600 mb-2">{selectedProduk.deskripsi}</p>
      <p className="text-blue-700 font-semibold text-lg mb-1">
        Rp {selectedProduk.harga.toLocaleString('id-ID')}
      </p>
      <p className="text-sm text-gray-500">Tipe: {selectedProduk.type}</p>
      <p className="text-sm text-gray-500">Stok: {selectedProduk.stock}</p>
    </div>
  </div>
)}

{checkoutProduk && (
  <div className="fixed top-0 left-0 right-0 mx-auto mt-10 z-[9999] w-full max-w-md">
    <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-2xl animate-fadeIn relative">
      <button
        onClick={closeCheckoutModal}
        className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl font-bold"
        aria-label="Tutup"
      >
        ×
      </button>

      <h3 className="text-xl font-bold text-blue-800 mb-4 text-center">🛒 Checkout Produk</h3>

      <img
        src={checkoutProduk.poto}
        alt={checkoutProduk.name}
        className="w-full h-40 object-cover rounded-lg mb-4"
      />
      <h4 className="text-lg font-semibold text-gray-800">{checkoutProduk.name}</h4>
      <p className="text-gray-600 text-sm mb-2">{checkoutProduk.deskripsi}</p>
      <p className="text-blue-700 font-semibold">
        Harga: Rp {checkoutProduk.harga.toLocaleString('id-ID')}
      </p>

      {/* Input Jumlah */}
      <div className="my-4">
        <label className="text-sm font-medium text-gray-700">Jumlah</label>
        <input
          type="number"
          min="1"
          value={jumlahBeli}
          onChange={(e) => setJumlahBeli(parseInt(e.target.value) || 1)}
          className="w-full mt-1 border rounded-md px-3 py-2"
        />
      </div>

      {/* Total Harga */}
      <p className="text-right font-semibold text-green-700 mb-4">
        Total: Rp {(checkoutProduk.harga * jumlahBeli).toLocaleString('id-ID')}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleSimpanKeKeranjang}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg"
        >
          Simpan ke Keranjang
        </button>

        <a
          href={`https://wa.me/6281214006515?text=Halo, saya ingin membeli *${checkoutProduk.name}* sebanyak *${jumlahBeli}* pcs. Total: *Rp ${(checkoutProduk.harga * jumlahBeli).toLocaleString('id-ID')}*`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-lg"
        >
          Checkout WhatsApp
        </a>
      </div>
    </div>
  </div>
)}


{/* === Section: Hot Deals Hari Ini (Swiper) === */}
<section id="hot-deals" className="py-16 px-6 md:px-20 bg-gradient-to-r from-yellow-50 to-pink-50">
  <h2 className="text-4xl font-extrabold text-center text-rose-700 mb-12 tracking-tight">
    🔥 Hot Deals Hari Ini
  </h2>

  <Swiper
    modules={[Autoplay, Navigation]}
    spaceBetween={20}
    slidesPerView={1}
    loop={true}
    autoplay={{ delay: 3000, disableOnInteraction: false }}
    navigation={true}
    breakpoints={{
      640: { slidesPerView: 2 },
      768: { slidesPerView: 3 },
      1024: { slidesPerView: 4 },
    }}
    className="z-10"
  >
    {produkData
      .filter((p) => p.stock <= 10)
      .slice(0, 10)
      .map((produk, index) => (
        <SwiperSlide key={index}>
          <div
            onClick={() => setSelectedProduk(produk)}
            className="group relative bg-white border border-rose-200 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden"
          >
            {/* Label HOT */}
            <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-full z-10 shadow">
              HOT
            </span>

            {/* Gambar Produk */}
            <img
              src={produk.poto}
              alt={produk.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Kilau efek */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition duration-300 pointer-events-none" />

            {/* Detail Produk */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-rose-700 transition duration-300">
                {produk.name}
              </h3>
              <p className="text-sm text-gray-600 truncate">{produk.deskripsi}</p>
              <div className="mt-3">
                <p className="text-xl font-bold text-rose-600">
                  Rp {produk.harga.toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-gray-500 mb-4">Stok tersisa: {produk.stock}</p>

                {/* Tombol Beli Sekarang */}
                <button
                onClick={(e) => {
                    e.stopPropagation()
                    setCheckoutProduk(produk)
                    setJumlahBeli(1)
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-xl transition duration-300"
                >
                Beli Sekarang
                </button>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
  </Swiper>
</section>

{/* === Section: Rekomendasi Untukmu === */}
<section id="rekomendasi" className="py-16 px-6 md:px-20 bg-white relative overflow-hidden">
  <h2 className="text-4xl font-bold text-center text-blue-900 mb-12 tracking-tight">
    🎯 Rekomendasi Untukmu
  </h2>

  <Swiper
    modules={[Autoplay, Navigation]}
    spaceBetween={20}
    slidesPerView={1}
    loop={true}
    autoplay={{ delay: 3000, disableOnInteraction: false }}
    navigation={true}
    breakpoints={{
      640: { slidesPerView: 2 },
      768: { slidesPerView: 3 },
      1024: { slidesPerView: 4 },
    }}
    className="z-10"
  >
    {produkData
      .sort(() => 0.5 - Math.random()) // Acak
      .slice(0, 10) // Batasi maksimal 10 rekomendasi
      .map((produk, index) => (
        <SwiperSlide key={index}>
          <div
            onClick={() => setSelectedProduk(produk)}
            className="relative bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-2xl shadow-md hover:shadow-xl cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out overflow-hidden flex flex-col h-full"
          >
            {/* Badge Rekomendasi */}
            <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded-full shadow z-10">
              Rekomendasi
            </span>

            {/* Gambar Produk */}
            <img
              src={produk.poto}
              alt={produk.name}
              className="w-full h-44 object-cover rounded-t-2xl"
            />

            {/* Detail Produk */}
            <div className="p-4 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-md font-bold text-blue-800 mb-1">{produk.name}</h3>
                <p className="text-sm text-gray-600 truncate">{produk.type}</p>
                <p className="text-blue-700 font-semibold mt-2">
                  Rp {produk.harga.toLocaleString('id-ID')}
                </p>
              </div>

              {/* Tombol Beli Sekarang */}
<button
  onClick={(e) => {
    e.stopPropagation()
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

  {/* Efek Latar Blur */}
  <div className="absolute -top-20 -left-20 w-[300px] h-[300px] bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse hidden md:block" />
  <div className="absolute -bottom-20 -right-20 w-[300px] h-[300px] bg-rose-100 rounded-full blur-3xl opacity-50 animate-pulse hidden md:block" />
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

    </PelangganLayout>
  )
}
