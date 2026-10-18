import { IMG } from './images'

export interface FotoDraft {
  src: string
  nama: string
}

export interface FasilitasDraft {
  nama: string
  ikon: string
}

export interface PaketDraft {
  id: string
  nama: string
  durasiJam: number
  harga: number
  lencana?: string
  lencanaCls?: string
  deskripsi: string
}

export interface TutupKhusus {
  id: string
  hari: string
  jam: string
  alasan: string
}

export const MAKS_FOTO = 4

/**
 * Draf form Tambah Ruangan (mockup PageTambahRuangan[.Mobile].html).
 * Semua isian dikosongkan agar diisi pengguna — hanya deskripsi yang
 * disediakan sebagai contoh.
 */
export const DRAF = {
  nama: '',
  kategori: '',
  venue: '',
  rating: 0,
  kapasitas: 0,
  deskripsi:
    'Ballroom mewah dengan tata suara akustik modern, pencahayaan fleksibel, cocok untuk seminar nasional, konferensi bisnis, workshop korporat, maupun pameran produk eksklusif.',
  tarifPerJam: 0,
  jamBuka: '',
  jamTutup: '',
  batasAcara: 0,
  wa: '',
  foto: [] as FotoDraft[],
  fasilitas: [] as FasilitasDraft[],
  paket: [] as PaketDraft[],
  tutupKhusus: [] as TutupKhusus[],
}

/** Opsi tag fasilitas — dipilih dari daftar, bukan diketik manual. */
export const OPS_FASILITAS: FasilitasDraft[] = [
  { nama: 'AC Central', ikon: 'mode_fan' },
  { nama: 'Sound System & Mic Wireless', ikon: 'speaker' },
  { nama: 'Proyektor & Layar', ikon: 'videocam' },
  { nama: 'WiFi Cepat', ikon: 'wifi' },
  { nama: 'Podium Pidato', ikon: 'podium' },
  { nama: 'Kursi & Meja Rapat', ikon: 'chair' },
  { nama: 'Parkir Luas', ikon: 'local_parking' },
  { nama: 'Mushola', ikon: 'mosque' },
  { nama: 'Kamar Mandi Dalam', ikon: 'shower' },
  { nama: 'Katering & Coffee Break', ikon: 'restaurant' },
  { nama: 'Keamanan 24 Jam', ikon: 'verified_user' },
  { nama: 'Genset Cadangan', ikon: 'power' },
]

/** Opsi provinsi (38 provinsi di Indonesia) untuk form lokasi. */
export const OPS_PROVINSI: string[] = [
  'Aceh',
  'Sumatera Utara',
  'Sumatera Barat',
  'Riau',
  'Jambi',
  'Sumatera Selatan',
  'Bengkulu',
  'Lampung',
  'Kepulauan Bangka Belitung',
  'Kepulauan Riau',
  'DKI Jakarta',
  'Jawa Barat',
  'Jawa Tengah',
  'DI Yogyakarta',
  'Jawa Timur',
  'Banten',
  'Bali',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Kalimantan Barat',
  'Kalimantan Tengah',
  'Kalimantan Selatan',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Sulawesi Utara',
  'Sulawesi Tengah',
  'Sulawesi Selatan',
  'Sulawesi Tenggara',
  'Gorontalo',
  'Sulawesi Barat',
  'Maluku',
  'Maluku Utara',
  'Papua',
  'Papua Barat',
  'Papua Selatan',
  'Papua Tengah',
  'Papua Pegunungan',
  'Papua Barat Daya',
]

/** Opsi jam operasional (interval 30 menit) untuk select Buka/Tutup Jam. */
export const OPS_JAM: string[] = Array.from(
  { length: 48 },
  (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 1 ? '30' : '00'}`,
)

/** Kumpulan foto cadangan untuk simulasi tombol unggah (aset lokal). */export const POOL_FOTO: FotoDraft[] = [
  { src: IMG.creative, nama: 'creative-hub.jpg' },
  { src: IMG.convention, nama: 'convention-hall.jpg' },
  { src: IMG.coworking, nama: 'coworking-hall.jpg' },
  { src: IMG.extra, nama: 'meeting-setup.jpg' },
]
