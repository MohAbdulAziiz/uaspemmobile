'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaGoogle } from 'react-icons/fa'

export default function PelangganLayout({ children, noPadding = false }) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { data: session, status } = useSession()

  // Redirect jika bukan pelanggan
useEffect(() => {
  if (status === 'loading') return
  if (!session) return router.replace('/login')

  const role = session?.user?.role?.toLowerCase()
  if (role !== 'pelanggan') return router.replace('/')

  const incompleteProfile =
    (!session.user.poto || session.user.poto === '/default-user.png') ||
    !session.user.alamat

  const protectedPaths = ['/pelanggan/produk', '/pelanggan/keranjang']

  if (protectedPaths.includes(pathname) && incompleteProfile) {
    alert('Silakan lengkapi profil terlebih dahulu (foto dan alamat).')
    router.replace('/pelanggan/profile')
  }
}, [session, status, router, pathname])


  const navItemClass = (path) =>
    `block px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
      pathname === path
        ? 'bg-blue-800 text-white'
        : 'text-white hover:bg-blue-700 hover:text-gray-100'
    }`

  // Scroll listener untuk warna navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Apakah kamu yakin ingin keluar?')
    if (confirmLogout) {
      await signOut({ callbackUrl: '/login' })
    }
  }

  if (status === 'loading') return null
  if (!session || session.user.role?.toLowerCase() !== 'pelanggan') return null

  return (
    <>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 shadow-md transition-all duration-300
          ${!isScrolled
            ? 'bg-gradient-to-r from-blue-900 to-black'
            : 'bg-gradient-to-r from-blue-900 to-black'}
        `}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center relative">
          <div className="text-2xl font-bold text-white">
            <Link href="/pelanggan">Samsung Store</Link>
          </div>

          <div className="md:hidden text-white z-50">
            <button onClick={() => setMenuOpen((prev) => !prev)} aria-label="Toggle Menu">
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          <div className="hidden md:flex space-x-4">
            <Link href="/pelanggan" className={navItemClass('/pelanggan')}>Home</Link>
            <Link href="/pelanggan/produk" className={navItemClass('/pelanggan/produk')}>Produk</Link>
            <Link href="/pelanggan/keranjang" className={navItemClass('/pelanggan/keranjang')}>Keranjang</Link>
            <Link href="/pelanggan/profile" className={navItemClass('/pelanggan/profile')}>Profile</Link>
            <button
              onClick={handleLogout}
              className="text-white hover:bg-red-600 px-4 py-2 rounded-xl font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden px-6 pb-4 flex flex-col space-y-2 bg-gradient-to-r from-blue-900 to-black z-40 relative">
            <Link href="/pelanggan" className={navItemClass('/pelanggan')}>Home</Link>
            <Link href="/pelanggan/produk" className={navItemClass('/pelanggan/produk')}>Produk</Link>
            <Link href="/pelanggan/keranjang" className={navItemClass('/pelanggan/keranjang')}>Keranjang</Link>
            <Link href="/pelanggan/profile" className={navItemClass('/pelanggan/profile')}>Profile</Link>
            <button
              onClick={handleLogout}
              className="text-white hover:bg-red-600 px-4 py-2 rounded-xl font-medium text-left"
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Konten Halaman */}
      <div className={`${noPadding ? '' : 'pt-20'} min-h-screen bg-black`}>
        {children}
      </div>

      {/* Footer */}
      <footer className="text-white bg-gradient-to-r from-blue-900 via-slate-900 to-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-6 py-10">
          <div>
            <h2 className="text-3xl font-bold text-cyan-200 mb-2">Samsung Store</h2>
            <p className="mb-3 text-sm text-white">Ikuti Kami</p>
            <div className="flex gap-4 text-xl text-white">
              <FaFacebookF className="hover:text-blue-400 cursor-pointer" />
              <FaInstagram className="hover:text-pink-400 cursor-pointer" />
              <FaLinkedinIn className="hover:text-blue-300 cursor-pointer" />
              <FaGoogle className="hover:text-red-400 cursor-pointer" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-cyan-100 mb-3">Informasi</h3>
            <ul className="space-y-2 text-white text-sm">
              <li>Tentang Kami</li>
              <li>Blog Teknologi</li>
              <li>Cara Pemesanan</li>
              <li>Program Trade-in</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-cyan-100 mb-3">Layanan Pelanggan</h3>
            <ul className="space-y-2 text-white text-sm">
              <li>Syarat & Ketentuan</li>
              <li>Garansi & Retur</li>
              <li>Kebijakan Privasi</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-cyan-100 mb-3">Alamat</h3>
            <p className="text-white text-sm mb-4">
              South Quarter, Jl. R.A. Kartini No.Kav. 8, Cilandak, Jakarta Selatan, DKI Jakarta 12430
            </p>

            <h3 className="font-semibold text-cyan-100 mb-3">Butuh bantuan? Kirim pesan:</h3>
            <form className="space-y-4">
              <textarea
                className="w-full p-2 text-sm text-white bg-slate-700 border border-slate-600 rounded-md"
                placeholder="Tulis pesan Anda di sini"
                rows="4"
              />
              <div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-900 to-black text-white px-6 py-2 rounded-xl hover:from-blue-800 hover:to-gray-900 transition duration-300"
                >
                  Kirim Pesan
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center border-t border-slate-700 py-4 text-white text-sm px-2">
          © 2025 SamsungStore - Semua Hak Cipta Dilindungi
        </div>
      </footer>
    </>
  )
}
