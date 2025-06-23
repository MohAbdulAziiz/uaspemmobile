import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
)

// GET: Ambil data user berdasarkan email
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email diperlukan' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// PUT: Update data user
export async function PUT(req) {
  const form = await req.formData()

  const id = form.get('id')
  const nama = form.get('nama')
  const email = form.get('email')
  const nohp = form.get('nohp')
  const username = form.get('username')
  const password = form.get('password')
  const poto = form.get('poto')
  const alamat = form.get('alamat')

  const updateData = {
    nama,
    email,
    nohp,
    username,
    password,
    alamat,
  }

  // Hanya update foto jika ada file baru
  if (poto && typeof poto.name === 'string') {
    const arrayBuffer = await poto.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileExt = poto.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { data: storage, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(`poto/${fileName}`, buffer, {
        contentType: poto.type,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/foto/${fileName}`
    updateData.poto = publicUrl
  }

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Data berhasil diperbarui' })
}
