import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    realtime: { enabled: false },
  }
)

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const { email, password } = credentials
        if (!email || !password) return null

        const { data: user, error } = await supabase
          .from('users')
          .select('id, nama, email, password, role, poto, nohp, verifikasi_via, username, alamat') // ✅ Tambah alamat
          .eq('email', email)
          .eq('password', password) // ⚠️ Gunakan hash di produksi
          .maybeSingle()

        if (error || !user) return null

        return {
          id: user.id,
          name: user.nama || user.email,
          email: user.email,
          password: user.password,
          role: user.role,
          poto: user.poto || '',
          nohp: user.nohp || '',
          verifikasi_via: user.verifikasi_via || '',
          username: user.username || '',
          alamat: user.alamat || '', // ✅ Masukkan alamat ke user
        }
      }
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.password = user.password
        token.role = user.role
        token.poto = user.poto
        token.nohp = user.nohp
        token.verifikasi_via = user.verifikasi_via
        token.username = user.username
        token.alamat = user.alamat // ✅ Simpan alamat ke token
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.password = token.password
        session.user.role = token.role
        session.user.poto = token.poto
        session.user.nohp = token.nohp
        session.user.verifikasi_via = token.verifikasi_via
        session.user.username = token.username
        session.user.alamat = token.alamat // ✅ Simpan alamat ke session
      }
      return session
    },

    async redirect({ baseUrl, token }) {
      if (token?.role) {
        switch (token.role) {
          case 'Admin':
            return `${baseUrl}/admin`
          case 'Pelanggan':
            return `${baseUrl}/pelanggan`
          case 'Pimpinan':
            return `${baseUrl}/pimpinan`
          case 'Staff Gudang':
            return `${baseUrl}/staff`
          default:
            return baseUrl
        }
      }
      return baseUrl
    }
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/login',
    error: '/login',
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
