import {
  INITIAL_TASKS,
  INITIAL_COLUMNS,
  INITIAL_NOTES,
  INITIAL_SPACES
} from './initialData';

export const INITIAL_WORKSPACES = [
  {
    id: 'ws-1',
    name: 'Kuliah & Studi',
    icon: '🎓',
    color: '#3b82f6',
    description: 'Mata kuliah, skripsi, dan kegiatan kampus'
  },
  {
    id: 'ws-2',
    name: 'Pekerjaan & Freelance',
    icon: '💼',
    color: '#00a884',
    description: 'Proyek klien, desain, coding, dan portofolio'
  },
  {
    id: 'ws-3',
    name: 'Personal & Rutinitas',
    icon: '🏠',
    color: '#ec4899',
    description: 'Target kebugaran, budgeting, dan pengembangan diri'
  }
];

export const getWorkspaceInitialData = (workspaceId) => {
  // 1. Workspace 1: Kuliah & Studi (Mahasiswa / Pelajar)
  if (workspaceId === 'ws-1') {
    return {
      tasks: INITIAL_TASKS,
      columns: INITIAL_COLUMNS,
      spaces: INITIAL_SPACES,
      notes: INITIAL_NOTES,
      channels: ['diskusi-umum', 'tugas-kelompok', 'catatan-kuliah', 'info-kampus']
    };
  }

  // 2. Workspace 2: Pekerjaan & Freelance (Freelancer / Solopreneur / Jasa Kreatif)
  if (workspaceId === 'ws-2') {
    return {
      spaces: [
        { id: 'all', name: '🌐 Semua Proyek Freelance', color: '#00a884' },
        { id: 'klien-web', name: '💻 Website UMKM Artisan Coffee', color: '#00a884' },
        { id: 'klien-brand', name: '🎨 Rebranding & Logo Studio Foto', color: '#ec4899' },
        { id: 'portofolio', name: '🚀 Portofolio Pribadi & CV', color: '#3b82f6' }
      ],
      columns: [
        { id: 'leads', title: 'Brief & Rencana', color: '#64748b', badge: 'Brief' },
        { id: 'in_progress', title: 'Pengerjaan Aktif', color: '#3b82f6', badge: 'Proses' },
        { id: 'review', title: 'Review & Revisi Klien', color: '#8b5cf6', badge: 'Revisi' },
        { id: 'done', title: 'Selesai & Serah Terima', color: '#10b981', badge: 'Selesai' }
      ],
      tasks: [
        {
          id: 'task-freelance-1',
          projectId: 'klien-web',
          title: 'Finalisasi UI Prototype & Katalog Produk Website Coffee Shop',
          description: 'Rancang prototype interaktif di Figma untuk halaman menu minuman, pemesanan cepat via WhatsApp, dan integrasi Google Maps lokasi toko.',
          status: 'in_progress',
          priority: 'urgent',
          dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
          tags: ['freelance'],
          assignee: 'kurnia',
          estimatedHours: 16,
          loggedMinutes: 360,
          subtasks: [
            { id: 'st-fl-1', text: 'Riset menu visual kompetitor kedai kopi lokal', completed: true },
            { id: 'st-fl-2', text: 'Buat prototype mobile navigasi & filter kategori minuman', completed: true },
            { id: 'st-fl-3', text: 'Presentasi mockup visual ke pemilik usaha', completed: false },
            { id: 'st-fl-4', text: 'Setup form direct order ke nomor WhatsApp kasir', completed: false }
          ],
          activityLog: [
            { id: 'act-fl-1', text: 'Mockup selesai 50% dan siap demo', timestamp: 'Hari ini, 10:20' }
          ]
        },
        {
          id: 'task-freelance-2',
          projectId: 'klien-brand',
          title: 'Eksplorasi 3 Opsi Sketsa Logo & Panduan Tipografi Studio Foto',
          description: 'Buat moodboard estetika monokrom modern, eksplorasi monogram inisial studio, dan pilih font komersial berlisensi legal.',
          status: 'leads',
          priority: 'high',
          dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
          tags: ['freelance'],
          assignee: 'sarah',
          estimatedHours: 10,
          loggedMinutes: 60,
          subtasks: [
            { id: 'st-fl-5', text: 'Kurasi 25 referensi visual di Behance & Dribbble', completed: true },
            { id: 'st-fl-6', text: 'Sketsa digital 3 variasi logo mark di iPad', completed: false },
            { id: 'st-fl-7', text: 'Kirim preview PDF dengan watermark ke klien', completed: false }
          ],
          activityLog: [
            { id: 'act-fl-2', text: 'Brief kreatif dikonfirmasi klien', timestamp: 'Kemarin, 15:40' }
          ]
        },
        {
          id: 'task-freelance-3',
          projectId: 'klien-web',
          title: 'Testing Responsivitas Mobile & Kecepatan Loading (Lighthouse > 90)',
          description: 'Optimasi kompresi gambar format WebP, caching browser, dan verifikasi tampilan di browser Chrome & Safari iOS.',
          status: 'review',
          priority: 'urgent',
          dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
          tags: ['freelance'],
          assignee: 'dimas',
          estimatedHours: 8,
          loggedMinutes: 300,
          subtasks: [
            { id: 'st-fl-8', text: 'Kompres seluruh foto galeri ke WebP (< 120KB)', completed: true },
            { id: 'st-fl-9', text: 'Uji audit Google PageSpeed Insights skor mobile', completed: true },
            { id: 'st-fl-10', text: 'Minta feedback user experience dari 3 tester', completed: false }
          ],
          activityLog: [
            { id: 'act-fl-3', text: 'Skor Lighthouse mobile berhasil mencapai 94', timestamp: 'Hari ini, 13:15' }
          ]
        },
        {
          id: 'task-freelance-4',
          projectId: 'portofolio',
          title: 'Pembaruan Studi Kasus Portofolio & Upload ke LinkedIn',
          description: 'Susun narasi problem-solution-result dari proyek desain website terakhir untuk menarik calon klien potensial berikutnya.',
          status: 'done',
          priority: 'normal',
          dueDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
          tags: ['freelance', 'personal'],
          assignee: 'kurnia',
          estimatedHours: 6,
          loggedMinutes: 320,
          subtasks: [
            { id: 'st-fl-11', text: 'Screenshot mockup 3D di frame laptop dan smartphone', completed: true },
            { id: 'st-fl-12', text: 'Tulis ringkasan hasil kenaikan konversi klien (+35%)', completed: true },
            { id: 'st-fl-13', text: 'Publikasi artikel studi kasus di LinkedIn & portfolio web', completed: true }
          ],
          activityLog: [
            { id: 'act-fl-4', text: 'Portofolio berhasil dipublikasikan 🎉', timestamp: 'Kemarin, 18:00' }
          ]
        }
      ],
      notes: `📌 Catatan Proyek Freelance:
- Selalu minta uang muka (DP 50%) sebelum memulai pengerjaan aset final.
- Batasi revisi maksimal 2x putaran sesuai kesepakatan surat penawaran.
- Nomor kontak klien Artisan Coffee: Pak Hendra (0812-xxxx-xxxx).`,
      channels: ['proyek-klien', 'keuangan-invoice', 'ide-konten', 'feedback-klien']
    };
  }

  // 3. Workspace 3: Personal & Rutinitas (Pengembangan Diri, Olahraga, Keuangan)
  if (workspaceId === 'ws-3') {
    return {
      spaces: [
        { id: 'all', name: '🌐 Semua Rencana Personal', color: '#ec4899' },
        { id: 'kesehatan', name: '🏃 Olahraga & Target Kebugaran', color: '#10b981' },
        { id: 'finansial', name: '💰 Budgeting & Tabungan Bulanan', color: '#3b82f6' },
        { id: 'hobi-buku', name: '📖 Reading Challenge & Self Growth', color: '#ec4899' }
      ],
      columns: [
        { id: 'ideas', title: 'Target & Keinginan', color: '#64748b', badge: 'Ide' },
        { id: 'active', title: 'Rutinitas Berjalan', color: '#3b82f6', badge: 'Aktif' },
        { id: 'habit', title: 'Evaluasi Pekanan', color: '#f59e0b', badge: 'Cek' },
        { id: 'achieved', title: 'Tercapai & Rayakan 🎉', color: '#10b981', badge: 'Selesai' }
      ],
      tasks: [
        {
          id: 'task-personal-1',
          projectId: 'kesehatan',
          title: 'Target Lari Pagi 5K & Latihan Kekuatan 3x Seminggu',
          description: 'Bangun kebiasaan hidup sehat, catat perkembangan jarak tempuh dan denyut nadi di smartwatch atau Strava.',
          status: 'active',
          priority: 'high',
          dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          tags: ['personal'],
          assignee: 'kurnia',
          estimatedHours: 5,
          loggedMinutes: 150,
          subtasks: [
            { id: 'st-ps-1', text: 'Sesi lari santai hari Selasa (3.5 km, pace 6:40)', completed: true },
            { id: 'st-ps-2', text: 'Workout calisthenics (pushup, core, plank) 20 menit', completed: true },
            { id: 'st-ps-3', text: 'Long run hari Minggu pagi mengelilingi stadion kampus', completed: false }
          ],
          activityLog: [
            { id: 'act-ps-1', text: 'Target lari 2 sesi tercapai minggu ini', timestamp: 'Hari ini, 07:15' }
          ]
        },
        {
          id: 'task-personal-2',
          projectId: 'finansial',
          title: 'Rekap Budget Bulanan & Alokasi Tabungan Dana Darurat',
          description: 'Catat total pengeluaran kos, makan, dan kuota. Sisihkan 20% penghasilan freelance ke tabungan reksa dana pasar uang.',
          status: 'habit',
          priority: 'urgent',
          dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
          tags: ['personal'],
          assignee: 'kurnia',
          estimatedHours: 2,
          loggedMinutes: 60,
          subtasks: [
            { id: 'st-ps-4', text: 'Cek mutasi rekening & struk belanja minimarket', completed: true },
            { id: 'st-ps-5', text: 'Transfer dana darurat ke akun investasi', completed: true },
            { id: 'st-ps-6', text: 'Kunci anggaran belanja impulsif online shop', completed: false }
          ],
          activityLog: [
            { id: 'act-ps-2', text: 'Alokasi tabungan bulan ini berhasil disisihkan', timestamp: 'Kemarin, 20:30' }
          ]
        },
        {
          id: 'task-personal-3',
          projectId: 'hobi-buku',
          title: 'Selesaikan Membaca Buku "Atomic Habits" Bab 1-5',
          description: 'Terapkan konsep 1% better every day dan buat ritual pemicu kebiasaan positif setiap bangun tidur.',
          status: 'active',
          priority: 'normal',
          dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
          tags: ['personal'],
          assignee: 'kurnia',
          estimatedHours: 4,
          loggedMinutes: 90,
          subtasks: [
            { id: 'st-ps-7', text: 'Baca 15 halaman setiap malam sebelum tidur', completed: true },
            { id: 'st-ps-8', text: 'Tulis intisari poin penting di Catatan Smart Scratchpad', completed: false },
            { id: 'st-ps-9', text: 'Bagikan kutipan inspiratif di story Instagram', completed: false }
          ],
          activityLog: [
            { id: 'act-ps-3', text: 'Bab 1 sampai 3 selesai dibaca', timestamp: '2 hari lalu' }
          ]
        },
        {
          id: 'task-personal-4',
          projectId: 'hobi-buku',
          title: 'Rencana Liburan Akhir Semester: Susun Itinerary & Budget',
          description: 'Riset destinasi camping pantai bersama sahabat, estimasi biaya sewa tenda, transportasi, dan perbekalan.',
          status: 'achieved',
          priority: 'low',
          dueDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
          tags: ['personal'],
          assignee: 'alex',
          estimatedHours: 3,
          loggedMinutes: 180,
          subtasks: [
            { id: 'st-ps-10', text: 'Pilih lokasi pantai dengan spot sunset terbaik', completed: true },
            { id: 'st-ps-11', text: 'Booking alat camping dan konfirmasi peserta', completed: true }
          ],
          activityLog: [
            { id: 'act-ps-4', text: 'Itinerary liburan rampung dan disepakati bersama', timestamp: '3 hari lalu' }
          ]
        }
      ],
      notes: `📌 Catatan Target & Kebiasaan:
- Prioritaskan tidur berkualitas minimal 7 jam per hari.
- Aturan 2 Menit: Jika tugas bisa diselesaikan dalam 2 menit, lakukan saat itu juga!
- Target tabungan dana darurat tahun ini: Rp 10.000.000.`,
      channels: ['target-harian', 'catatan-finansial', 'kebugaran-olahraga', 'wishlist-buku']
    };
  }

  // Fallback for new custom workspaces created by user
  return {
    spaces: [
      { id: 'all', name: '🌐 Semua Proyek', color: '#6366f1' },
      { id: 'proj-main', name: '📌 Target Utama', color: '#6366f1' }
    ],
    columns: INITIAL_COLUMNS,
    tasks: [],
    notes: '📌 Tulis target dan rencana ruang kerja ini di sini...',
    channels: ['diskusi-umum', 'catatan-tugas']
  };
};
