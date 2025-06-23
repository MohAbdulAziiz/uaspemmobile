'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentPath, setCurrentPath] = useState('') // default kosong, biar gak trigger hydration mismatch

  // Ambil pathname dengan aman di client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname)
    }
  }, [])

  const navItemClass = (path) =>
    `block px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
      currentPath === path
        ? 'bg-blue-800 text-white'
        : 'text-white hover:bg-blue-700 hover:text-gray-100'
    }`

  // Scroll Observer
  useEffect(() => {
    if (router.pathname !== '/') {
      setIsScrolled(true)
      return
    }

    const timeout = setTimeout(() => {
      const homeSection = document.getElementById('home')
      if (!homeSection) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsScrolled(!entry.isIntersecting)
        },
        { threshold: 0.1 }
      )

      observer.observe(homeSection)

      return () => observer.disconnect()
    }, 0)

    return () => clearTimeout(timeout)
  }, [router.pathname])

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 shadow-md transition-all duration-300 ${
        !isScrolled && router.pathname === '/'
          ? 'bg-transparent'
          : 'bg-gradient-to-r from-blue-900 to-black'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center relative">
        <div className="text-2xl font-bold text-white">
          <Link href="/">Samsung Store</Link>
        </div>

        <div className="md:hidden text-white z-50">
          <button onClick={() => setMenuOpen((prev) => !prev)} aria-label="Toggle Menu">
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <div className="hidden md:flex space-x-4">
          <Link href="/" className={navItemClass('/')}>Home</Link>
          <Link href="/product" className={navItemClass('/product')}>Product</Link>
          <Link href="/tracking" className={navItemClass('/tracking')}>Tracking</Link>
          <Link href="/login" className={navItemClass('/login')}>Login</Link>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col space-y-2 bg-gradient-to-r from-blue-900 to-black z-40 relative">
          <Link href="/" className={navItemClass('/')}>Home</Link>
          <Link href="/product" className={navItemClass('/product')}>Product</Link>
          <Link href="/tracking" className={navItemClass('/tracking')}>Tracking</Link>
          <Link href="/login" className={navItemClass('/login')}>Login</Link>
        </div>
      )}
    </nav>
  )
}
