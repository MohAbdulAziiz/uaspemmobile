import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendVerificationEmail } from '@/lib/mailer'
import { sendWhatsAppVerification } from '@/lib/whatsapp'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(req) {
  try {
    const body = await req.json()
    const { nama, email, nohp, username, password, role, verifikasi_via } = body

    console.log('DATA MASUK REGISTER:', body)

    // Validasi semua field wajib
    if (!nama || !email || !nohp || !username || !password || !verifikasi_via) {
      return NextResponse.json({ message: 'Semua field wajib diisi' }, { status: 400 })
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Format email tidak valid' }, { status: 400 })
    }

    // Validasi nomor HP: harus angka dan diawali 62
    if (!nohp.startsWith('62') || !/^\d+$/.test(nohp)) {
      return NextResponse.json({ message: 'No HP harus diawali dengan 62 dan hanya angka' }, { status: 400 })
    }

    // Validasi password huruf dan angka minimal 6 karakter
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/
    if (!passwordRegex.test(password)) {
      return NextResponse.json({
        message: 'Password harus mengandung huruf dan angka (min. 6 karakter)',
      }, { status: 400 })
    }

    // Konsistensi dan validasi metode verifikasi
    const verifikasiVia = String(verifikasi_via).trim().toLowerCase()
    if (!['email', 'whatsapp'].includes(verifikasiVia)) {
      return NextResponse.json({ message: 'Metode verifikasi tidak valid' }, { status: 400 })
    }

    // Cek duplikat email atau username
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)

    if (checkError) throw checkError

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({ message: 'Email atau Username sudah terdaftar' }, { status: 409 })
    }

    // Generate kode verifikasi 6 digit
    const kode = Math.floor(100000 + Math.random() * 900000).toString()

    // Simpan user baru ke database
    const { error: insertError } = await supabase.from('users').insert([{
      nama,
      email,
      nohp,
      username,
      password, // ⚠️ jangan lupa hash password di production
      role: role || 'Pelanggan',
      verifikasi_via: verifikasiVia,
      verifikasi_code: kode,
      verifikasi: false,
      created_at: new Date().toISOString(),
    }])

    if (insertError) throw insertError

    // Kirim kode verifikasi, handle error pengiriman agar tidak menggagalkan response sukses
    try {
      if (verifikasiVia === 'email') {
        await sendVerificationEmail(email, kode)
      } else if (verifikasiVia === 'whatsapp') {
        await sendWhatsAppVerification(nohp, kode, nama)
      }
    } catch (sendError) {
      console.error('Gagal kirim kode verifikasi:', sendError)
      // Tetap lanjutkan response sukses walau gagal kirim kode verifikasi
    }

    return NextResponse.json({ message: 'Kode verifikasi telah dikirim', kode }, { status: 201 })
  } catch (error) {
    console.error('REGISTRASI ERROR:', error)

    if (
      error.message?.includes('fetch') ||
      error.message?.includes('network') ||
      error.message?.includes('Failed to fetch')
    ) {
      return NextResponse.json({
        message: 'Gagal menghubungi server. Silakan coba lagi beberapa saat.',
      }, { status: 503 })
    }

    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
