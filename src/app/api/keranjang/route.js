// app/api/keranjang/route.js
import { createClient } from '@supabase/supabase-js'
import { writeFile } from 'fs/promises'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, nohp, name, harga, jumlah, poto } = body

    if (!email || !name || !harga || !jumlah || !poto) {
      return new Response(JSON.stringify({ error: 'Data tidak lengkap.' }), { status: 400 })
    }

    let imageUrl = poto

    // Cek apakah poto dalam format base64
    if (poto.startsWith('data:image')) {
      const matches = poto.match(/^data:image\/(\w+);base64,(.+)$/)

      if (!matches) {
        return new Response(JSON.stringify({ error: 'Format gambar base64 tidak valid.' }), { status: 400 })
      }

      const ext = matches[1]
      const base64Data = matches[2]
      const buffer = Buffer.from(base64Data, 'base64')
      const filename = `produk-${Date.now()}.${ext}`
      const filepath = path.join(process.cwd(), 'public', 'uploads', filename)

      await writeFile(filepath, buffer)
      imageUrl = `/uploads/${filename}`
    }

    const totalHarga = harga * jumlah

    const { error } = await supabase
      .from('keranjang')
      .insert([
        {
          email,
          nohp,
          name,
          harga: totalHarga,
          jumlah,
          poto: imageUrl
        }
      ])

    if (error) {
      console.error('Gagal simpan ke keranjang:', error.message)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ message: 'Berhasil disimpan ke keranjang.' }), { status: 200 })

  } catch (err) {
    console.error('Error server:', err)
    return new Response(JSON.stringify({ error: 'Terjadi kesalahan server.' }), { status: 500 })
  }
}
