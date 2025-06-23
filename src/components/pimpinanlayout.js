'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Menu, X, ChevronLeft, ChevronRight, Home, Users, Folder, Calendar, LogOut, ShoppingBag
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)


export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [userDetail, setUserDetail] = useState(null)

  const dropdownRef = useRef(null)
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const sidebarWidth = isCollapsed ? 80 : 256

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/pimpinan' },
    { name: 'Pembelian', icon: ShoppingBag, path: '/pimpinan/pembelian' },
    { name: 'Laporan', icon: Calendar, path: '/pimpinan/laporan' },
    { name: 'Profile', icon: Users, path: '/pimpinan/profile' },
  ]

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') return router.replace('/login')
    if (session?.user?.role?.toLowerCase() !== 'pimpinan') return router.replace('/')
  }, [session, status, router])

  useEffect(() => {
    const fetchUserDetail = async () => {
      if (!session?.user?.email) return
      const { data, error } = await supabase
        .from('users')
        .select('poto, nohp')
        .eq('email', session.user.email)
        .single()

      if (!error) setUserDetail(data)
    }
    fetchUserDetail()
  }, [session])

  const handleLogout = async () => {
    const confirmLogout = confirm('Yakin ingin logout?')
    if (confirmLogout) {
      await signOut({ callbackUrl: '/login' })
    }
  }

  if (status === 'loading' || !session) return null

  // Foto dari /uploads/foto.jpg atau fallback default
  const potoSrc = userDetail?.poto
    ? `/uploads/${userDetail.poto}`
    : '/default-user.png'

  return (
    <div className="h-screen overflow-hidden bg-gray-100">
      <aside className={`
        fixed top-0 left-0 z-40 h-full text-white transition-all duration-300
        flex flex-col justify-between bg-gradient-to-t from-black via-[#1e2a38] to-[#1e3a5f]
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isDesktop ? '' : (mobileOpen ? 'translate-x-0' : '-translate-x-full')}
      `}>
        <div>
          <div className="p-4 flex justify-between items-center border-b border-indigo-500">
            {!isCollapsed && <span className="font-bold text-lg">Admin Samsung Store</span>}
            <button onClick={() => isDesktop ? setIsCollapsed(!isCollapsed) : setMobileOpen(false)}>
              {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {navItems.map(item => {
              const isActive = pathname === item.path
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.path)}
                  className={`flex items-center space-x-3 px-2 py-2 rounded w-full text-left transition
                    ${isActive ? 'bg-indigo-600' : 'hover:bg-indigo-500'}
                  `}
                  
                >
                  <item.icon className="w-5 h-5" />
                  {!isCollapsed && <span>{item.name}</span>}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-indigo-500">
          <div className="flex items-center space-x-3 mb-4">
<img
  src={session.user.poto || '/uploads/default-user.png'}
  alt="User"
  className="w-10 h-10 rounded-full object-cover border border-white"
/>
            {!isCollapsed && (
              <div>
                <p className="font-semibold">{session.user.name}</p>
                <p className="text-sm text-indigo-200">{session.user.role}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="text-sm text-indigo-300 mb-4 space-y-1">
              <p>📧 {session.user.email}</p>
              <p>📱 {userDetail?.nohp || '-'}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-400 hover:text-white px-2 py-2 w-full hover:bg-red-600 rounded"
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {!isDesktop && mobileOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className="flex flex-col h-screen transition-all duration-300"
        style={{ paddingLeft: isDesktop ? `${sidebarWidth}px` : '0px' }}
      >
<header className="h-14 bg-[#1e3a5f] text-white shadow px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-30">
  {!isDesktop && (
    <button onClick={() => setMobileOpen(!mobileOpen)}>
      {mobileOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  )}

  {/* User Avatar & Dropdown */}
  <div className="flex items-center gap-4 ml-auto relative" ref={dropdownRef}>
    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="focus:outline-none">
      <img
        src={session?.user?.poto || '/uploads/default-user.png'}
        alt="User"
        className="w-10 h-10 rounded-full object-cover border border-white"
      />
    </button>

    {dropdownOpen && (
      <div className="absolute right-0 top-12 bg-white text-black rounded shadow-lg w-40 py-2 z-50">
        <button
          className="w-full text-left px-4 py-2 hover:bg-gray-100"
          onClick={() => {
            setDropdownOpen(false) // tutup dropdown
            router.push('/pimpinan/profile') // arahkan ke halaman profil
          }}
        >
          Profil
        </button>
        <button
          className="w-full text-left px-4 py-2 hover:bg-gray-100"
          onClick={() => {
            setDropdownOpen(false)
            handleLogout()
          }}
        >
          Logout
        </button>
      </div>
    )}
  </div>
</header>
        <main className="mt-14 flex-1 overflow-auto p-6 bg-gray-100">
          <div className="bg-white shadow rounded-lg p-6 min-h-[calc(100vh-3.5rem)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
