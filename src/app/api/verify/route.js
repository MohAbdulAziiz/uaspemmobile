// app/api/verify/route.js
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
)

export async function POST(req) {
  const { email, nohp, kode } = await req.json()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('nohp', nohp)
    .eq('verifikasi_code', kode)
    .single()

  if (error || !data) {
    return NextResponse.json({ message: 'Kode verifikasi salah' }, { status: 400 })
  }

  await supabase
    .from('users')
    .update({ verifikasi: true })
    .eq('id', data.id)

  return NextResponse.json({ message: 'Verifikasi berhasil' })
}
