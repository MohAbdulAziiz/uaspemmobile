'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { createClient } from '@supabase/supabase-js'
import PelangganLayout from '@/components/pelangganlayout'

ChartJS.register(ArcElement, Tooltip, Legend)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function PelangganPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [keranjang, setKeranjang] = useState([])
  const [selectedItems, setSelectedItems] = useState([])
  const [stats, setStats] = useState({
    users: 0,
    produk: 0,
    review: 0,
    pembelian: 0,
    produkByType: {},
    usersByRole: {},
  })

  // === State tambahan untuk bukti pembayaran ===
  const [nama, setNama] = useState('')
  const [nohp, setNohp] = useState('')
  const [poto, setPoto] = useState(null)
  const [statusList, setStatusList] = useState([])

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') return router.replace('/login')
    if (session?.user?.role?.toLowerCase() !== 'pelanggan') return router.replace('/')
  }, [session, status, router])

  useEffect(() => {
    const fetchStatsAndCart = async () => {
      const [users, produk, review, pembelian, keranjangRes] = await Promise.all([
        supabase.from('users').select('role'),
        supabase.from('produk').select('type'),
        supabase.from('review').select('*'),
        supabase.from('bayar').select('*'),
        supabase.from('keranjang').select('*').eq('email', session?.user?.email)
      ])

      const usersByRole = {}
      users.data?.forEach(u => {
        const role = u.role || 'Unknown'
        usersByRole[role] = (usersByRole[role] || 0) + 1
      })

      const produkByType = {}
      produk.data?.forEach(p => {
        const type = p.type || 'Unknown'
        produkByType[type] = (produkByType[type] || 0) + 1
      })

      setStats({
        users: users.data?.length || 0,
        produk: produk.data?.length || 0,
        review: review.data?.length || 0,
        pembelian: pembelian.data?.length || 0,
        usersByRole,
        produkByType
      })

      setKeranjang(keranjangRes.data || [])
      setNama(session?.user?.nama || '')
      setNohp(session?.user?.nohp || '')
    }

    if (session?.user?.role?.toLowerCase() === 'pelanggan') {
      fetchStatsAndCart()
    }
  }, [session])

  // 🔄 Ambil data pembayaran
  const fetchStatusList = async () => {
    const { data, error } = await supabase
      .from('pembayaran')
      .select('*')
      .eq('email', session?.user?.email)
      .order('id', { ascending: false })

    if (!error) setStatusList(data)
  }

  useEffect(() => {
    if (session?.user?.email) {
      fetchStatusList()
    }
  }, [session])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!poto) return alert('Mohon pilih foto.')

    const reader = new FileReader()
    reader.onload = async () => {
      const base64Poto = reader.result

      const tanggal = new Date()
      const dd = String(tanggal.getDate()).padStart(2, '0')
      const mm = String(tanggal.getMonth() + 1).padStart(2, '0')
      const yy = String(tanggal.getFullYear()).slice(2, 4)
      const kode = `PSN${dd}${mm}${yy}${Date.now().toString().slice(-4)}`

      const res = await fetch('/api/pembayaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          nohp: session.user.nohp,
          alamat: session.user.alamat,
          nama,
          poto: base64Poto,
          kode,
          status: 'Menunggu Verifikasi',
        })
      })

      const result = await res.json()

      if (!res.ok) {
        console.error('Gagal upload:', result.error)
        return alert('Gagal upload bukti pembayaran.')
      }

      alert('Upload berhasil!')
      fetchStatusList()
    }

    reader.readAsDataURL(poto)
  }

  const toggleSelectItem = (name) => {
    setSelectedItems((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    )
  }

  const updateJumlah = async (name, newJumlah) => {
    const item = keranjang.find((i) => i.name === name)
    const hargaPerItem = item.harga / item.jumlah
    const totalBaru = hargaPerItem * newJumlah

    const { error } = await supabase
      .from('keranjang')
      .update({ jumlah: newJumlah, harga: totalBaru })
      .eq('email', session.user.email)
      .eq('name', name)

    if (!error) {
      setKeranjang((prev) =>
        prev.map((item) =>
          item.name === name ? { ...item, jumlah: newJumlah, harga: totalBaru } : item
        )
      )
    }
  }

  const hapusItem = async (name) => {
    const { error } = await supabase
      .from('keranjang')
      .delete()
      .eq('email', session.user.email)
      .eq('name', name)

    if (!error) {
      setKeranjang((prev) => prev.filter((item) => item.name !== name))
      setSelectedItems((prev) => prev.filter((n) => n !== name))
    }
  }

  const totalHarga = keranjang
    .filter((item) => selectedItems.includes(item.name))
    .reduce((sum, item) => sum + item.harga, 0)

  if (status === 'loading' || !session) {
    return <p className="p-6">Loading...</p>
  }

  return (
    <PelangganLayout noPadding>
      {/* === Hero Section Video === */}
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
        <div className="relative z-20 flex items-center justify-center h-full px-6 text-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
              Keranjang Belanja Anda
            </h1>
            <p className="text-2xl font-semibold drop-shadow-md">
              Cek kembali dan lanjutkan proses pembayaran
            </p>
          </div>
        </div>
      </section>

<section className="px-4 sm:px-6 md:px-12 lg:px-20 py-10 bg-white">
  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 text-blue-900">
    🛍️ Produk di Keranjang
  </h2>

  {keranjang.length === 0 ? (
    <p className="text-center text-gray-600 text-sm sm:text-base">Keranjang Anda kosong.</p>
  ) : (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {keranjang.map((item, index) => (
          <div
            key={index}
            className="relative border rounded-xl shadow-sm bg-blue-50 flex flex-col overflow-hidden"
          >
            {/* Checkbox */}
            <div className="absolute top-3 left-3 z-10">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.name)}
                onChange={() => toggleSelectItem(item.name)}
                className="w-5 h-5 text-blue-600"
              />
            </div>

            {/* Gambar Produk */}
            <img
              src={item.poto}
              alt={item.name}
              className="w-full h-40 sm:h-48 object-cover rounded-t-xl"
            />

            {/* Konten Produk */}
            <div className="p-4 flex flex-col justify-between flex-grow text-sm sm:text-base">
              <h4 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">
                {item.name}
              </h4>

              {/* Jumlah Produk */}
              <div className="flex items-center gap-2 mb-2">
                <span>Jumlah:</span>
                <button
                  onClick={() => updateJumlah(item.name, Math.max(1, item.jumlah - 1))}
                  className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                >-</button>
                <span>{item.jumlah}</span>
                <button
                  onClick={() => updateJumlah(item.name, item.jumlah + 1)}
                  className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                >+</button>
              </div>

              {/* Total Harga */}
              <p className="text-blue-700 font-semibold">
                Total: Rp {item.harga.toLocaleString('id-ID')}
              </p>

              {/* Tombol Hapus */}
              <button
                onClick={() => hapusItem(item.name)}
                className="mt-3 text-red-500 hover:underline text-sm self-end"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout */}
      <div className="mt-10 text-center">
        <p className="text-base sm:text-lg font-semibold text-green-700 mb-4">
          Total Pembayaran: Rp {totalHarga.toLocaleString('id-ID')}
        </p>

<a
  href={`https://wa.me/6281214006515?text=${encodeURIComponent(
    `Halo, saya ingin membeli produk berikut:\n\n` +
    keranjang
      .filter((item) => selectedItems.includes(item.name))
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.name}\n   Jumlah: ${item.jumlah} pcs\n   Subtotal: Rp ${item.harga.toLocaleString('id-ID')}`
      )
      .join('\n\n') +
    `\n\nTotal Pembayaran: Rp ${totalHarga.toLocaleString('id-ID')}`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className={`inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition ${
    selectedItems.length === 0 ? 'pointer-events-none opacity-50' : ''
  }`}
>
  Beli Sekarang via WhatsApp
</a>

      </div>
    </>
  )}
</section>

<section className="bg-gray-100 py-10 px-4 sm:px-6 lg:px-16">
  <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-blue-700">
    📤 Upload Bukti Pembayaran
  </h2>

  <form
    onSubmit={handleUpload}
    className="bg-white p-6 sm:p-8 rounded-xl shadow max-w-xl mx-auto mb-10 space-y-4"
  >
    <input
      type="text"
      placeholder="Nama"
      value={nama}
      onChange={(e) => setNama(e.target.value)}
      className="w-full border rounded px-4 py-2 text-sm sm:text-base"
      required
    />
    <input
      type="email"
      placeholder="Email"
      value={session?.user?.email || ''}
      disabled
      className="w-full border rounded px-4 py-2 bg-gray-100 text-sm sm:text-base"
    />
    <input
      type="text"
      placeholder="No HP"
      value={session?.user?.nohp || ''}
      disabled
      className="w-full border rounded px-4 py-2 bg-gray-100 text-sm sm:text-base"
    />
    <input
      type="text"
      placeholder="Alamat"
      value={session?.user?.alamat || ''}
      disabled
      className="w-full border rounded px-4 py-2 bg-gray-100 text-sm sm:text-base"
    />
    <input
      type="file"
      accept="image/*"
      onChange={(e) => setPoto(e.target.files[0])}
      className="w-full text-sm"
      required
    />
    <button
      type="submit"
      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm sm:text-base"
    >
      Unggah Bukti Pembayaran
    </button>
  </form>

  <h3 className="text-xl sm:text-2xl font-semibold text-center mb-4 text-blue-800">
    📦 Deskripsi Pesanan
  </h3>

<div className="w-full overflow-x-auto">
  <div className="min-w-[700px]">
    <table className="w-full table-auto text-sm bg-white shadow rounded-lg">
      <thead>
        <tr className="bg-blue-100 text-blue-800 text-left">
          <th className="p-2 whitespace-nowrap">Kode</th>
          <th className="p-2 whitespace-nowrap">Nama</th>
          <th className="p-2 whitespace-nowrap">Email</th>
          <th className="p-2 whitespace-nowrap">Handphone</th>
          <th className="p-2 whitespace-nowrap">Alamat</th>
          <th className="p-2 whitespace-nowrap">Status</th>
        </tr>
      </thead>
      <tbody>
        {statusList.map((item, idx) => (
          <tr key={idx} className="border-b">
            <td className="p-2 whitespace-nowrap">{item.kode}</td>
            <td className="p-2 whitespace-nowrap">{item.nama}</td>
            <td className="p-2 whitespace-nowrap">{item.email}</td>
            <td className="p-2 whitespace-nowrap">{item.nohp}</td>
            <td className="p-2 whitespace-nowrap">{item.alamat}</td>
            <td className="p-2 whitespace-nowrap">
              <span
                className={`px-2 py-1 text-xs sm:text-sm font-medium rounded-full text-white ${
                  {
                    'Menunggu Verifikasi': 'bg-yellow-500',
                    'Sedang Diproses': 'bg-blue-500',
                    'Dikirim': 'bg-indigo-500',
                    'Diterima': 'bg-green-600'
                  }[item.status] || 'bg-gray-400'
                }`}
              >
                {item.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
</section>

    </PelangganLayout>
  )
}
