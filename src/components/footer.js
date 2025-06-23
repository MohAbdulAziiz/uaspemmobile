'use client'

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGoogle,
} from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="text-white bg-gradient-to-r from-blue-900 via-slate-900 to-black mt-auto">
      {/* Konten utama */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-6 py-10">
        {/* Brand dan Sosial Media */}
        <div>
          <h2 className="text-3xl font-bold text-cyan-200 mb-2">Samsung Store</h2>
          <p className="mb-3 text-sm text-white">Ikuti Kami</p>
          <div className="flex gap-4 text-xl">
            <button type="button"><FaFacebookF className="hover:text-blue-400 cursor-pointer" /></button>
            <button type="button"><FaInstagram className="hover:text-pink-400 cursor-pointer" /></button>
            <button type="button"><FaLinkedinIn className="hover:text-blue-300 cursor-pointer" /></button>
            <button type="button"><FaGoogle className="hover:text-red-400 cursor-pointer" /></button>
          </div>
        </div>

        {/* Informasi */}
        <div>
          <h3 className="font-semibold text-cyan-100 mb-3">Informasi</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-cyan-200">Tentang Kami</a></li>
            <li><a href="#" className="hover:text-cyan-200">Blog Teknologi</a></li>
            <li><a href="#" className="hover:text-cyan-200">Cara Pemesanan</a></li>
            <li><a href="#" className="hover:text-cyan-200">Program Trade-in</a></li>
          </ul>
        </div>

        {/* Layanan Pelanggan */}
        <div>
          <h3 className="font-semibold text-cyan-100 mb-3">Layanan Pelanggan</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-cyan-200">Syarat & Ketentuan</a></li>
            <li><a href="#" className="hover:text-cyan-200">Garansi & Retur</a></li>
            <li><a href="#" className="hover:text-cyan-200">Kebijakan Privasi</a></li>
          </ul>
        </div>

        {/* Alamat dan Form */}
        <div>
          <h3 className="font-semibold text-cyan-100 mb-3">Alamat</h3>
          <p className="text-sm mb-4">
            South Quarter, Jl. R.A. Kartini No.Kav. 8, Cilandak, Jakarta Selatan, DKI Jakarta 12430
          </p>

          <h3 className="font-semibold text-cyan-100 mb-3">Butuh bantuan? Kirim pesan:</h3>
          <form className="space-y-4">
            <textarea
              className="w-full p-2 text-sm bg-slate-700 border border-slate-600 rounded-md"
              placeholder="Tulis pesan Anda di sini"
              rows="4"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-900 to-black text-white px-6 py-2 rounded-xl hover:from-blue-800 hover:to-gray-900 transition duration-300"
            >
              Kirim Pesan
            </button>
          </form>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center border-t border-slate-700 py-4 text-sm px-2">
        © 2025 SamsungStore - Semua Hak Cipta Dilindungi
      </div>
    </footer>
  )
}
