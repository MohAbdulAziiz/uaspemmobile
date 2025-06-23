import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Inisialisasi Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET() {
  try {
    // Ambil data users
    const { data: users, error: userError } = await supabase
      .from('users') // Pastikan nama tabel adalah `users`
      .select('id, nama, username, password, email, nohp, role, verifikasi_via, poto') // Gunakan `poto`, bukan `foto`

    if (userError) throw new Error(userError.message)

    // Ambil data produk
    const { data: produk, error: produkError } = await supabase
      .from('produk')
      .select('id, name, type, stock, poto')

    if (produkError) throw new Error(produkError.message)

    // Kembalikan response JSON
    return NextResponse.json({ users, produk })
  } catch (error) {
    console.error('❌ Gagal ambil data laporan:', error)
    return NextResponse.json({ error: 'Gagal ambil data laporan' }, { status: 500 })
  }
}
