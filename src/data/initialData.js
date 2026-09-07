export const INITIAL_COLUMNS = [
  { id: 'todo', title: 'Daftar Tugas', color: '#3b82f6', badge: 'To Do' },
  { id: 'in_progress', title: 'Sedang Dikerjakan', color: '#f59e0b', badge: 'Fokus' },
  { id: 'review', title: 'Revisi & Review', color: '#8b5cf6', badge: 'Review' },
  { id: 'done', title: 'Selesai Dikumpulkan', color: '#10b981', badge: 'Selesai' },
];

export const INITIAL_PRIORITIES = {
  urgent: { label: 'Mendesak', color: '#ef4444', icon: 'AlertTriangle', order: 1 },
  high: { label: 'Penting', color: '#f97316', icon: 'Flame', order: 2 },
  normal: { label: 'Normal', color: '#3b82f6', icon: 'Clock', order: 3 },
  low: { label: 'Rendah', color: '#6b7280', icon: 'ArrowDown', order: 4 },
};

export const INITIAL_TAGS = [
  { id: 'skripsi', label: 'Skripsi & Riset', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
  { id: 'kuliah', label: 'Tugas Kuliah', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  { id: 'praktikum', label: 'Praktikum Lab', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
  { id: 'organisasi', label: 'Organisasi & Event', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  { id: 'freelance', label: 'Proyek Klien', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  { id: 'personal', label: 'Target Pribadi', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
];

export const INITIAL_SPACES = [
  { id: 'all', name: '🌐 Semua Proyek Kuliah', color: '#3b82f6' },
  { id: 'skripsi', name: '📚 Skripsi & Penelitian Akhir', color: '#8b5cf6' },
  { id: 'semester', name: '📝 Tugas Mata Kuliah & Praktikum', color: '#3b82f6' },
  { id: 'organisasi', name: '🏛️ BEM & Kegiatan Kampus', color: '#10b981' },
];

export const INITIAL_MEMBERS = [
  {
    id: 'kurnia',
    name: 'Kurnia',
    role: 'Saya (Pemilik Ruang)',
    avatar: 'K',
    color: '#00a884',
    email: 'kurnia@keepwork.id',
    department: 'Akun Utama',
    status: 'active',
    isOwner: true,
    capacity: 6
  },
  {
    id: 'alex',
    name: 'Alex Rivera',
    role: 'Teman Belajar',
    avatar: 'AR',
    color: '#6366f1',
    email: 'alex@keepwork.id',
    department: 'Rekan Tim',
    status: 'active',
    isOwner: false,
    capacity: 5
  },
  {
    id: 'sarah',
    name: 'Sarah Chen',
    role: 'Partner Desain',
    avatar: 'SC',
    color: '#ec4899',
    email: 'sarah@keepwork.id',
    department: 'Kreatif & Media',
    status: 'active',
    isOwner: false,
    capacity: 4
  },
  {
    id: 'dimas',
    name: 'Dimas Pratama',
    role: 'Rekan Coding Lab',
    avatar: 'DP',
    color: '#10b981',
    email: 'dimas@keepwork.id',
    department: 'Teknik Informatika',
    status: 'active',
    isOwner: false,
    capacity: 5
  }
];

const today = new Date();
const formatDate = (daysOffset) => {
  const d = new Date();
  d.setDate(today.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TASKS = [
  {
    id: 'task-101',
    projectId: 'skripsi',
    title: 'Bimbingan Bab 2 Kajian Teori & Matriks Literatur Jurnal',
    description: 'Konsultasi dengan Dosen Pembimbing untuk memvalidasi landasan teori, metodologi riset, dan format sitasi ilmiah standar APA 7th edition.',
    status: 'in_progress',
    priority: 'urgent',
    dueDate: formatDate(1),
    tags: ['skripsi'],
    assignee: 'kurnia',
    estimatedHours: 12,
    loggedMinutes: 180,
    subtasks: [
      { id: 'st-1', text: 'Rangkum 5 jurnal internasional bereputasi terkait topik', completed: true },
      { id: 'st-2', text: 'Susun kerangka berpikir & bagan konseptual penelitian', completed: true },
      { id: 'st-3', text: 'Cek format sitasi kutipan APA Style 7th Edition di Mendeley', completed: true },
      { id: 'st-4', text: 'Cetak draft bimbingan & siapkan lembar konsultasi dosen', completed: false },
    ],
    activityLog: [
      { id: 'act-1', text: 'Tugas bimbingan dijadwalkan oleh Kurnia', timestamp: 'Kemarin, 09:30' },
      { id: 'act-2', text: 'Status diubah ke Fokus Pengerjaan', timestamp: 'Hari ini, 10:15' },
    ]
  },
  {
    id: 'task-102',
    projectId: 'semester',
    title: 'Laporan Praktikum Basis Data & Perancangan ERD Toko Online',
    description: 'Selesaikan dokumentasi laporan resmi praktikum modul 4, normalisasi tabel 1NF-3NF, dan eksekusi skrip DDL/DML PostgreSQL.',
    status: 'review',
    priority: 'high',
    dueDate: formatDate(0),
    tags: ['kuliah', 'praktikum'],
    assignee: 'dimas',
    estimatedHours: 10,
    loggedMinutes: 420,
    subtasks: [
      { id: 'st-5', text: 'Normalisasi tabel relasional 1NF sampai 3NF', completed: true },
      { id: 'st-6', text: 'Tulis dan uji query SQL agregasi, JOIN, & Stored Procedure', completed: true },
      { id: 'st-7', text: 'Buat kesimpulan analisis performa indexing query', completed: true },
      { id: 'st-8', text: 'Konversi laporan ke PDF dan cek format cover praktikum', completed: false },
    ],
    activityLog: [
      { id: 'act-3', text: 'Dimas menyelesaikan 3 subtask analisis SQL', timestamp: 'Hari ini, 11:45' },
      { id: 'act-4', text: 'Tugas dipindahkan ke Revisi & Review', timestamp: 'Hari ini, 14:00' },
    ]
  },
  {
    id: 'task-103',
    projectId: 'organisasi',
    title: 'Proposal Sponsor & Susunan Rundown Seminar Nasional Kampus',
    description: 'Susun dokumen sponsorship untuk diajukan ke instansi mitra, serta tentukan susunan rundown acara bersama panitia divisi acara.',
    status: 'in_progress',
    priority: 'normal',
    dueDate: formatDate(3),
    tags: ['organisasi'],
    assignee: 'sarah',
    estimatedHours: 8,
    loggedMinutes: 120,
    subtasks: [
      { id: 'st-9', text: 'Finalisasi estimasi anggaran konsumsi, audio & merchandise', completed: true },
      { id: 'st-10', text: 'Draft surat permohonan narasumber & proposal sponsorship', completed: true },
      { id: 'st-11', text: 'Koordinasi teknis gladi bersih dengan tim perlengkapan', completed: false },
    ],
    activityLog: [
      { id: 'act-5', text: 'Sarah Chen memperbarui rincian paket sponsor', timestamp: 'Hari ini, 13:00' },
    ]
  },
  {
    id: 'task-104',
    projectId: 'semester',
    title: 'Persiapan Ujian Tengah Semester: Rangkuman Materi Algoritma',
    description: 'Pelajari slide perkuliahan minggu 1-7, pahami time complexity Big-O, algoritma greedy, dan dynamic programming.',
    status: 'todo',
    priority: 'high',
    dueDate: formatDate(4),
    tags: ['kuliah'],
    assignee: 'alex',
    estimatedHours: 6,
    loggedMinutes: 0,
    subtasks: [
      { id: 'st-12', text: 'Rangkum konsep rekursi & divide and conquer', completed: true },
      { id: 'st-13', text: 'Latihan coding 10 soal algoritma di LeetCode', completed: false },
      { id: 'st-14', text: 'Diskusi pemecahan soal bersama kelompok belajar', completed: false },
    ],
    activityLog: [
      { id: 'act-6', text: 'Tugas dijadwalkan menjelang minggu ujian', timestamp: '2 hari lalu' },
    ]
  },
  {
    id: 'task-105',
    projectId: 'semester',
    title: 'Submit Makalah Etika Profesi & Cek Plagiarisme Turnitin',
    description: 'Pastikan naskah makalah bebas plagiasi (< 15%), lampirkan lembar pengesahan, dan unggah ke portal kuliah sebelum tenggat waktu.',
    status: 'done',
    priority: 'normal',
    dueDate: formatDate(-1),
    tags: ['kuliah'],
    assignee: 'kurnia',
    estimatedHours: 6,
    loggedMinutes: 250,
    subtasks: [
      { id: 'st-15', text: 'Cek similarity index Turnitin di perpustakaan (< 15%)', completed: true },
      { id: 'st-16', text: 'Tanda tangani surat pernyataan keaslian karya bermaterai', completed: true },
      { id: 'st-17', text: 'Unggah file PDF final ke portal e-learning kampus', completed: true },
    ],
    activityLog: [
      { id: 'act-7', text: 'Kurnia menyelesaikan seluruh checklist makalah', timestamp: 'Kemarin, 17:00' },
      { id: 'act-8', text: 'Makalah berhasil disubmit ke e-learning 🎉', timestamp: 'Kemarin, 17:05' },
    ]
  },
  {
    id: 'task-106',
    projectId: 'skripsi',
    title: 'Eksplorasi Ide Judul Topik Skripsi Alternatif (Machine Learning / IoT)',
    description: 'Siapkan opsi judul cadangan dengan studi komparasi algoritma klasifikasi jika proposal utama membutuhkan penyesuaian.',
    status: 'todo',
    priority: 'low',
    dueDate: formatDate(7),
    tags: ['skripsi'],
    assignee: 'alex',
    estimatedHours: 4,
    loggedMinutes: 0,
    subtasks: [
      { id: 'st-18', text: 'Cari referensi dataset publik di Kaggle / UCI Repository', completed: false },
      { id: 'st-19', text: 'Konsultasi informal dengan asisten laboratorium riset', completed: false },
    ],
    activityLog: [
      { id: 'act-9', text: 'Ditambahkan ke ide riset cadangan', timestamp: '3 hari lalu' },
    ]
  }
];

export const INITIAL_NOTES = `📌 Target Fokus Pekan Ini:
- Prioritas Utama: Bimbingan Bab 2 Skripsi & tuntaskan laporan praktikum Basis Data.
- Target Harian: Terapkan metode Pomodoro (3 sesi x 25 menit fokus belajar tanpa distrak sosmed).
- Pengingat: Cek batas waktu upload e-learning kampus sebelum jam 23:59 WIB!`;
