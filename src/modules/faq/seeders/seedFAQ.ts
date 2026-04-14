import FAQs from "../models/FAQModel";

const initialFAQs = [
  // Produk & Keamanan
  {
    question: "Apakah produk PE Skinpro aman untuk Ibu Hamil & Menyusui?",
    answer: "Ya, produk PE Skinpro diformulasikan dengan bahan-bahan yang aman dan lembut. Namun, kami tetap menyarankan Anda untuk berkonsultasi dengan dokter kandungan Anda sebelum mencoba rutinitas skincare baru selama masa kehamilan atau menyusui.",
    category: "Produk & Keamanan",
    order: 1,
    helpful: 124,
    not_helpful: 2,
    status: "published" as const
  },
  {
    question: "Apakah produk sudah terdaftar di BPOM dan bersertifikat Halal?",
    answer: "Tentu saja. Seluruh produk PE Skinpro telah melalui uji laboratorium yang ketat dan secara resmi terdaftar di BPOM RI serta memiliki sertifikasi Halal dari MUI untuk menjamin keamanan dan kenyamanan penggunaan bagi seluruh pelanggan kami.",
    category: "Produk & Keamanan",
    order: 2,
    helpful: 89,
    not_helpful: 0,
    status: "published" as const
  },
  {
    question: "Berapa lama masa kadaluarsa produk PE Skinpro?",
    answer: "Masa kadaluarsa produk kami rata-rata adalah 24-36 bulan sejak tanggal produksi. Anda dapat melihat tanggal persisnya (EXP Date) pada bagian bawah kemasan atau lipatan segel tube.",
    category: "Produk & Keamanan",
    order: 3,
    helpful: 45,
    not_helpful: 1,
    status: "published" as const
  },
  // Pengiriman & Kurir
  {
    question: "Berapa lama waktu pengiriman pesanan saya?",
    answer: "Untuk wilayah Jabodetabek, estimasi pengiriman adalah 1-3 hari kerja. Untuk luar Jabodetabek, estimasi pengiriman berkisar antara 3-7 hari kerja tergantung pada layanan ekspedisi yang Anda pilih.",
    category: "Pengiriman & Kurir",
    order: 1,
    helpful: 210,
    not_helpful: 5,
    status: "published" as const
  },
  {
    question: "Kurir apa saja yang tersedia di PE Skinpro?",
    answer: "Kami bekerja sama dengan berbagai ekspedisi terpercaya seperti JNE, J&T, SiCepat, SAP, serta layanan instan seperti GoSend dan GrabExpress untuk wilayah tertentu.",
    category: "Pengiriman & Kurir",
    order: 2,
    helpful: 67,
    not_helpful: 3,
    status: "published" as const
  },
  {
    question: "Bagaimana cara melacak pesanan saya?",
    answer: "Setelah pesanan Anda dikirim, Anda akan menerima nomor resi melalui WhatsApp atau email. Anda juga dapat melacak status pesanan secara real-time melalui halaman 'Akun Saya' di dalam website pembeli.",
    category: "Pengiriman & Kurir",
    order: 3,
    helpful: 156,
    not_helpful: 8,
    status: "published" as const
  },
  // Pembayaran
  {
    question: "Metode pembayaran apa saja yang didukung?",
    answer: "Kami mendukung berbagai metode pembayaran melalui DOKU, termasuk Virtual Account (BCA, Mandiri, BNI, BRI), QRIS, Kartu Kredit, serta metode pembayaran di tempat (COD) melalui kurir tertentu.",
    category: "Pembayaran",
    order: 1,
    helpful: 92,
    not_helpful: 1,
    status: "published" as const
  },
  {
    question: "Apakah belanja di website PE Skinpro aman?",
    answer: "Sangat aman. Website kami dilengkapi dengan enkripsi SSL terbaru dan sistem pembayaran kami dikelola oleh payment gateway DOKU yang telah tersertifikasi tingkat internasional.",
    category: "Pembayaran",
    order: 2,
    helpful: 48,
    not_helpful: 0,
    status: "published" as const
  },
  // Pengembalian & Retur
  {
    question: "Bagaimana jika saya menerima produk yang rusak?",
    answer: "Jangan khawatir. Jika Anda menerima produk yang rusak atau bocor saat pengiriman, mohon segera hubungi admin kami melalui WhatsApp dengan menyertakan VIDEO UNBOXING sebagai syarat klaim penggantian produk baru selambat-lambatnya 2x24 jam setelah produk diterima.",
    category: "Pengembalian & Retur",
    order: 1,
    helpful: 75,
    not_helpful: 12,
    status: "published" as const
  },
  {
    question: "Apakah saya bisa menukar produk yang sudah dibeli?",
    answer: "Mohon maaf, karena alasan kebersihan dan keamanan produk skincare, kami tidak dapat menerima penukaran atau pengembalian produk yang segelnya telah dibuka kecuali terbukti ada kesalahan pengiriman dari pihak kami.",
    category: "Pengembalian & Retur",
    order: 2,
    helpful: 33,
    not_helpful: 6,
    status: "published" as const
  }
];

const seedFAQ = async () => {
  try {
    // Clear existing to avoid duplicates if re-run
    await FAQs.destroy({ where: {}, truncate: true });
    
    await FAQs.bulkCreate(initialFAQs);
    console.log("✅ FAQ seeding successful!");
    process.exit(0);
  } catch (err) {
    console.error("❌ FAQ seeding failed:", err);
    process.exit(1);
  }
};

seedFAQ();
