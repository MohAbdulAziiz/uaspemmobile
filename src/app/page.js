'use client'

import { useRouter } from 'next/navigation'
import Navbar from '../components/navbar'
import Footer from '../components/footer'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import { Navigation, Autoplay } from 'swiper/modules';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function HomePage() {
  const router = useRouter()
  const [reviews, setReviews] = useState([])
  const [input, setInput] = useState("")
  const [reply, setReply] = useState("")

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

      {/* Hero Section */}
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
        <div className="absolute inset-0 bg-gradient-to-r from-black via-blue-900 to-black opacity-70 z-10" />
        <div className="relative z-20 flex items-center justify-start h-full px-6 md:px-20">
          <div className="text-white max-w-xl">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Samsung Store</h1>
            <p className="text-lg mb-6">
              Temukan berbagai tipe HP Samsung terbaru dengan harga terbaik. Pesan sekarang dan nikmati kemudahan pelacakan pengiriman.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-blue-900 to-black text-white px-6 py-2 rounded-xl hover:from-blue-800 hover:to-gray-900 transition duration-300"
            >
              Pesan Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* Video Section */}
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

      {/* Review Section */}
      <section className="bg-gray-100 py-12 px-4 sm:px-6 md:px-12 lg:px-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-800 mb-8">
          💬 Review Pelanggan
        </h2>

        <div className="max-w-xl mx-auto text-center mb-10">
          <p className="mb-4 text-sm text-gray-700">Ingin memberikan review? Login terlebih dahulu.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-800 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm sm:text-base transition duration-300"
          >
            ✍️ Tambahkan Review
          </button>
        </div>

        <div className="max-w-3xl mx-auto space-y-6 mb-10">
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
