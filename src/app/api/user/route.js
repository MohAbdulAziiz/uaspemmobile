import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Inisialisasi Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// GET - Ambil semua user
export async function GET() {
  const { data, error } = await supabase.from('users').select('*')
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
  return new Response(JSON.stringify(data), { status: 200 })
}

// POST - Tambah user baru
export async function POST(req) {
  try {
    const formData = await req.formData()

    const nama = formData.get('nama')
    const username = formData.get('username')
    const email = formData.get('email')
    const password = formData.get('password')
    const nohp = formData.get('nohp') // ⬅️ Tambah ini
    const role = formData.get('role')
    const verifikasi_via = formData.get('verifikasi_via')
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

    const { data, error } = await supabase.from('users').insert([{
      nama,
      username,
      email,
      password,
      nohp, // ⬅️ Pastikan dikirim ke Supabase
      role,
      verifikasi_via,
      verifikasi,
      poto: potoUrl
    }])

    if (error) {
      console.error('Supabase Insert Error:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ message: 'User berhasil ditambahkan', data }), { status: 201 })
  } catch (err) {
    console.error('Unexpected Error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}

// PUT - Update user (inline atau form multipart)
export async function PUT(req) {
  try {
    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const body = await req.json()
      const { id, ...fields } = body

      const { error } = await supabase.from('users').update(fields).eq('id', id)

      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      return new Response(JSON.stringify({ message: 'User berhasil diupdate' }), { status: 200 })
    } else {
      const formData = await req.formData()
      const id = formData.get('id')
      const nama = formData.get('nama')
      const username = formData.get('username')
      const email = formData.get('email')
      const password = formData.get('password')
      const role = formData.get('role')
      const verifikasi_via = formData.get('verifikasi_via')
      const verifikasi = formData.get('verifikasi') === 'true'

      let potoUrl = formData.get('fotoLama') || ''
      const poto = formData.get('poto')

      if (poto && typeof poto.name === 'string') {
        const buffer = Buffer.from(await poto.arrayBuffer())
        const fileName = `${Date.now()}-${poto.name}`
        const filePath = path.join(process.cwd(), 'public', 'uploads', fileName)

        fs.mkdirSync(path.dirname(filePath), { recursive: true })
        fs.writeFileSync(filePath, buffer)

        potoUrl = `/uploads/${fileName}`
      }

      const { error } = await supabase.from('users').update({
        nama,
        username,
        email,
        password,
        role,
        verifikasi_via,
        verifikasi,
        poto: potoUrl
      }).eq('id', id)

      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      return new Response(JSON.stringify({ message: 'User berhasil diupdate' }), { status: 200 })
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}

// DELETE - Hapus user berdasarkan id
export async function DELETE(req) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return new Response(JSON.stringify({ error: 'ID tidak ditemukan' }), { status: 400 })
  }

  const { error } = await supabase.from('users').delete().eq('id', id)

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify({ message: 'User berhasil dihapus' }), { status: 200 })
}
