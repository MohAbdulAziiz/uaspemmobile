// app/api/cek-koneksi/route.js
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
)

export async function GET() {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1)

    if (error) {
      console.error("Error koneksi Supabase:", error)
      return NextResponse.json({ message: 'Koneksi gagal', error }, { status: 500 })
    }

    return NextResponse.json({ message: 'Koneksi berhasil', data }, { status: 200 })
  } catch (err) {
    console.error("Kesalahan server:", err)
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
