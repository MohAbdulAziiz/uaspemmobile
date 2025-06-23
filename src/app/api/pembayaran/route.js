import { writeFile } from 'fs/promises'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
)

// === GET: Ambil semua data pembayaran ===
export async function GET() {
  const { data, error } = await supabase
    .from('pembayaran')
    .select('*')
    .order('id', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }

  return new Response(JSON.stringify(data), {
    status: 200,
  })
}

// === POST: Simpan bukti pembayaran baru ===
export async function POST(request) {
  try {
    const body = await request.json()
    const { email, nama, nohp, poto, kode, alamat, status } = body

    if (!email || !nama || !nohp || !poto || !kode || !alamat || !status) {
      return new Response(JSON.stringify({ error: 'Data tidak lengkap.' }), { status: 400 })
    }

    let imageUrl = poto

    if (poto.startsWith('data:image')) {
      const matches = poto.match(/^data:image\/(\w+);base64,(.+)$/)
      if (!matches) {
        return new Response(JSON.stringify({ error: 'Format gambar tidak valid.' }), { status: 400 })
      }

      const ext = matches[1]
      const base64Data = matches[2]
      const buffer = Buffer.from(base64Data, 'base64')
      const filename = `bukti-${Date.now()}.${ext}`
      const filepath = path.join(process.cwd(), 'public', 'uploads', filename)

      await writeFile(filepath, buffer)
      imageUrl = `/uploads/${filename}`
    }

    const { error } = await supabase.from('pembayaran').insert([{
      email,
      nama,
      nohp,
      poto: imageUrl,
      kode,
      alamat,
      status
    }])

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ message: 'Pembayaran berhasil diunggah.' }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Terjadi kesalahan server.' }), { status: 500 })
  }
}

// === PUT: Update status berdasarkan ID ===
export async function PUT(request) {
  try {
    const { id, status } = await request.json()

    if (!id || !status) {
      return new Response(JSON.stringify({ error: 'ID dan status diperlukan.' }), { status: 400 })
    }

    const { error } = await supabase
      .from('pembayaran')
      .update({ status })
      .eq('id', id)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ message: 'Status berhasil diperbarui.' }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Terjadi kesalahan server.' }), { status: 500 })
  }
}
