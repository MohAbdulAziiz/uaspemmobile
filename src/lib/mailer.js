// lib/mailer.js
import nodemailer from 'nodemailer'

export async function sendVerificationEmail(email, kode) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_SENDER,       // email kamu
      pass: process.env.EMAIL_PASS,         // App Password, bukan password biasa
    },
  })

  const mailOptions = {
    from: `"Admin Samsung Store" <${process.env.EMAIL_SENDER}>`,
    to: email,
    subject: 'Verifikasi Akun Anda - Samsung Store',
    text: `Halo ${email},\n\nTerima kasih telah mendaftar di Samsung Store.\n\nKode verifikasi Anda: ${kode}\n\nJika Anda tidak merasa melakukan pendaftaran, abaikan email ini.\n\nSalam,\nAdmin Samsung Store`,
    html: `
      <p>Halo ${email},</p>
      <p>Terima kasih telah mendaftar di <b>Samsung Store</b>.</p>
      <p>Untuk menyelesaikan pendaftaran, silakan masukkan kode berikut:</p>
      <h2 style="color:#333;letter-spacing:2px;">${kode}</h2>
      <p>Jika Anda tidak merasa melakukan pendaftaran, abaikan email ini.</p>
      <p>Salam hormat,<br/>Admin Samsung Store</p>
    `,
  }

  await transporter.sendMail(mailOptions)
}
