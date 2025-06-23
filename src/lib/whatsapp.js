// lib/whatsapp.js
export async function sendWhatsAppVerification(nohp, kode, nama) {
  const apiKey = process.env.FONNTE_API_KEY;

  const message = `Halo ${nama} 👋 \n\n Assalamu'alaikum\n\nTerima kasih telah mendaftar di Samsung Store.\n\nBerikut adalah kode verifikasi akun Anda:\n\n🔐 *${kode}*\n\nSilakan masukkan kode ini untuk menyelesaikan proses pendaftaran.\n\nJika Anda tidak merasa melakukan pendaftaran, abaikan pesan ini.\n\nSalam,\nSamsung Store`;

  const response = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      target: nohp,
      message,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || "Gagal mengirim pesan WhatsApp");
  }

  return data;
}
