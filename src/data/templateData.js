export const STARTER_TEMPLATES = [
  // 1. Operasional & Bisnis
  {
    id: 'tpl-biz-onboarding',
    category: 'Bisnis & Operasional',
    name: 'SOP Onboarding Klien / Proyek Baru',
    title: 'Onboarding Klien Baru: [Nama Perusahaan / Klien]',
    description: 'Prosedur standar inisiasi proyek, pengumpulan berkas kebutuhan, kickoff meeting, dan penyerahan akses kolaborasi.',
    priority: 'high',
    tags: ['operational', 'business'],
    subtasks: [
      { id: 'st-biz-1', text: 'Kirim formulir briefing kebutuhan & dokumen NDA', completed: false },
      { id: 'st-biz-2', text: 'Jadwalkan kickoff meeting dan perkenalan tim inti', completed: false },
      { id: 'st-biz-3', text: 'Buat workspace & undang PIC klien ke channel komunikasi', completed: false },
      { id: 'st-biz-4', text: 'Finalisasi timeline rilis dan ruang lingkup kerja (SOW)', completed: false }
    ]
  },
  {
    id: 'tpl-biz-weekly-report',
    category: 'Bisnis & Operasional',
    name: 'Penyusunan Laporan Evaluasi Mingguan',
    title: 'Laporan Evaluasi Mingguan: Periode [Tanggal]',
    description: 'Penyusunan laporan capaian KPI, penggunaan anggaran, hambatan operasional, serta rencana kerja pekan berikutnya.',
    priority: 'normal',
    tags: ['report', 'operational'],
    subtasks: [
      { id: 'st-rep-1', text: 'Kumpulkan data metrik dan progres dari setiap divisi', completed: false },
      { id: 'st-rep-2', text: 'Analisis gap antara target vs realisasi mingguan', completed: false },
      { id: 'st-rep-3', text: 'Dokumentasikan isu kritis atau risiko yang butuh eskalasi', completed: false },
      { id: 'st-rep-4', text: 'Kirimkan draf laporan ke pimpinan/stakeholder untuk tinjauan', completed: false }
    ]
  },

  // 2. Kreatif, Konten & Media
  {
    id: 'tpl-creative-social',
    category: 'Kreatif & Konten',
    name: 'Produksi Konten Media Sosial / Kampanye',
    title: 'Konten Media Sosial: [Tema / Judul Konten]',
    description: 'Siklus lengkap pembuatan konten mulai dari riset topik, copywriting, desain grafis/video, hingga penjadwalan tayang.',
    priority: 'normal',
    tags: ['marketing', 'design'],
    subtasks: [
      { id: 'st-soc-1', text: 'Riset tren, hashtag, dan tentukan angle materi konten', completed: false },
      { id: 'st-soc-2', text: 'Penyusunan naskah copywriting & call-to-action (CTA)', completed: false },
      { id: 'st-soc-3', text: 'Produksi aset visual / grafis / thumbnail video', completed: false },
      { id: 'st-soc-4', text: 'Tinjauan internal & persetujuan materi final', completed: false },
      { id: 'st-soc-5', text: 'Jadwalkan postingan dan siapkan tim untuk interaksi komentar', completed: false }
    ]
  },
  {
    id: 'tpl-creative-design',
    category: 'Kreatif & Konten',
    name: 'Eksplorasi Desain Visual & Banner',
    title: 'Desain Visual Banner: [Nama Kampanye / Kebutuhan]',
    description: 'Pengerjaan materi visual iklan atau banner promosi sesuai pedoman identitas visual brand.',
    priority: 'normal',
    tags: ['design'],
    subtasks: [
      { id: 'st-des-1', text: 'Kumpulkan referensi moodboard dan spesifikasi dimensi', completed: false },
      { id: 'st-des-2', text: 'Buat 2-3 alternatif konsep desain awal', completed: false },
      { id: 'st-des-3', text: 'Tinjau konsistensi warna, tipografi, dan kontras visual', completed: false },
      { id: 'st-des-4', text: 'Ekspor aset dalam format WebP/PNG resolusi tinggi', completed: false }
    ]
  },

  // 3. Proyek & Teknis
  {
    id: 'tpl-tech-feature',
    category: 'Proyek & Produk',
    name: 'Pengembangan Fitur & Proyek Klien (Milestone)',
    title: 'Pengembangan Fitur: [Nama Fitur Baru]',
    description: 'Siklus pengembangan dari perencanaan spesifikasi, desain antarmuka, pembuatan endpoint/logika, hingga uji kelayakan.',
    priority: 'high',
    tags: ['freelance', 'project'],
    subtasks: [
      { id: 'st-feat-1', text: 'Penyusunan spesifikasi teknis dan kriteria penerimaan (AC)', completed: false },
      { id: 'st-feat-2', text: 'Implementasi antarmuka dan interaktivitas komponen', completed: false },
      { id: 'st-feat-3', text: 'Penyambungan logika data dan penanganan kondisi error', completed: false },
      { id: 'st-feat-4', text: 'Pengujian mandiri (smoke test) dan peninjauan kode tim', completed: false }
    ]
  },
  {
    id: 'tpl-tech-bug',
    category: 'Proyek & Produk',
    name: 'Investigasi & Perbaikan Masalah (Bug/Issue)',
    title: 'Investigasi Masalah: [Deskripsi Singkat Bug]',
    description: 'Penanganan insiden atau bug sistem: mereproduksi masalah, analisis akar penyebab, perbaikan, dan verifikasi ulang.',
    priority: 'urgent',
    tags: ['bug', 'investigation'],
    subtasks: [
      { id: 'st-bug-1', text: 'Reproduksi masalah dan catat langkah pemicunya', completed: false },
      { id: 'st-bug-2', text: 'Investigasi log sistem dan cari akar penyebab utama', completed: false },
      { id: 'st-bug-3', text: 'Terapkan perbaikan dan pastikan tidak ada dampak regresi', completed: false },
      { id: 'st-bug-4', text: 'Verifikasi di lingkungan uji sebelum pembaruan live', completed: false }
    ]
  }
];
