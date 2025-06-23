import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// GET - Ambil semua produk
export async function GET() {
  const { data, error } = await supabase.from('produk').select('*').order('created_at', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify(data), { status: 200 })
}

// POST - Tambah produk baru
export async function POST(req) {
  try {
    const formData = await req.formData()

    const name = formData.get('name')
    const type = formData.get('type')
    const harga = parseInt(formData.get('harga'))
    const stock = parseInt(formData.get('stock'))
    const deskripsi = formData.get('deskripsi')
    const verifikasi = formData.get('verifikasi') === 'true'
    const poto = formData.get('poto')

    let potoUrl = ''

    if (poto && typeof poto.name === 'string') {
      const buffer = Buffer.from(await poto.arrayBuffer())
      const fileName = `${Date.now()}-${poto.name}`
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName)

      fs.mkdirSync(path.dirname(filePath), { recursive: true })
      fs.writeFileSync(filePath, buffer)

      potoUrl = `/uploads/${fileName}`
    }

    const { data, error } = await supabase.from('produk').insert([{
      name,
      type,
      harga,
      stock,
      deskripsi,
      verifikasi,
      poto: potoUrl
    }])

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ message: 'Produk berhasil ditambahkan', data }), { status: 201 })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}

// PUT - Update produk
export async function PUT(req) {
  try {
    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const body = await req.json()
      const { id, ...fields } = body

      const { error } = await supabase.from('produk').update(fields).eq('id', id)

      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      return new Response(JSON.stringify({ message: 'Produk berhasil diupdate' }), { status: 200 })
    } else {
      const formData = await req.formData()

      const id = formData.get('id')
      const name = formData.get('name')
      const type = formData.get('type')
      const harga = parseInt(formData.get('harga'))
      const stock = parseInt(formData.get('stock'))
      const deskripsi = formData.get('deskripsi')
      const verifikasi = formData.get('verifikasi') === 'true'
      const fotoLama = formData.get('fotoLama') || ''
      const poto = formData.get('poto')

      let potoUrl = fotoLama

      if (poto && typeof poto.name === 'string') {
        const buffer = Buffer.from(await poto.arrayBuffer())
        const fileName = `${Date.now()}-${poto.name}`
        const filePath = path.join(process.cwd(), 'public', 'uploads', fileName)

        fs.mkdirSync(path.dirname(filePath), { recursive: true })
        fs.writeFileSync(filePath, buffer)

        potoUrl = `/uploads/${fileName}`
      }

      const { error } = await supabase.from('produk').update({
        name,
        type,
        harga,
        stock,
        deskripsi,
        verifikasi,
        poto: potoUrl
      }).eq('id', id)

      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      return new Response(JSON.stringify({ message: 'Produk berhasil diupdate' }), { status: 200 })
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}

// DELETE - Hapus produk
export async function DELETE(req) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return new Response(JSON.stringify({ error: 'ID tidak ditemukan' }), { status: 400 })
  }

  const { error } = await supabase.from('produk').delete().eq('id', id)

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify({ message: 'Produk berhasil dihapus' }), { status: 200 })
}
