/**
 * Data mock halaman Audit Log — mockup `Audit.html` (SOP FR-I1, FR-G4, FR-G5).
 * 14 entri rentang 18–24 Okt 2026 (2 halaman tabel); payload JSON tiap entri
 * dibangun dari field terstruktur supaya modal "Salin JSON" berfungsi nyata.
 */

export type JenisAksi =
  | 'banding'
  | 'penonaktifan'
  | 'verifikasi'
  | 'persetujuan_reservasi'
  | 'pembatalan_reservasi'
  | 'hapus_riwayat'
  | 'keamanan'

export type PeranAktor = 'admin' | 'penyedia' | 'penyewa' | 'sistem' | 'keamanan'

export interface EntriLog {
  id: string
  /** Waktu tayang di kolom tabel. */
  waktu: string
  /** Cap waktu untuk payload JSON. */
  iso: string
  /** Hari sejak 24 Okt 2026 — dasar filter rentang & "24 Jam Terakhir". */
  hariLalu: number
  aktor: string
  inisial: string
  aktorId: string
  peran: PeranAktor
  /** Label chip aksi di tabel. */
  aksi: string
  jenis: JenisAksi
  /** true → chip aksi merah (keputusan penolakan). */
  ditolak?: boolean
  entitas: string
  /** ID publik entitas tanpa tanda # (dipakai payload JSON). */
  refId: string
  entitasJenis: 'PROVIDER_ACCOUNT' | 'BOOKING' | 'USER_ACCOUNT' | 'IP_ADDRESS'
  keterangan: string
  /** Referensi klausul SOP — tampil mono setelah keterangan. */
  sop: string[]
  /** Baris kedua keterangan (IP ternotenkripsi, nota, job scheduler, dst.). */
  meta: string
  metaNada?: 'full'
  ip: string
  kodeAksi: string
  sha: string
}

/** Label pilihan filter "Jenis Aksi" (dropdown + chip cepat). */
export const JENIS_AKSI: Record<JenisAksi, string> = {
  verifikasi: 'Verifikasi Penyedia',
  penonaktifan: 'Penonaktifan Akun',
  banding: 'Keputusan Banding',
  persetujuan_reservasi: 'Persetujuan Reservasi',
  pembatalan_reservasi: 'Pembatalan Reservasi',
  hapus_riwayat: 'Penghapusan Riwayat',
  keamanan: 'Pembatasan Keamanan',
}

/** Label, warna chip, dan warna avatar per aktor. */
export const PERAN_AKTOR: Record<PeranAktor, { label: string; chip: string; avatar: string }> = {
  admin: { label: 'Super Admin', chip: 'bg-purple-100 text-primary', avatar: 'bg-primary text-white' },
  penyedia: { label: 'Penyedia (Mitra)', chip: 'bg-purple-100 text-purple-700', avatar: 'bg-purple-300 text-purple-700' },
  penyewa: { label: 'Penyewa', chip: 'bg-purple-100 text-secondary', avatar: 'bg-secondary-fixed text-secondary' },
  sistem: { label: 'Sistem Otomatis', chip: 'bg-status-available-bg text-status-available', avatar: 'bg-status-available-bg text-status-available' },
  keamanan: { label: 'Sistem Keamanan', chip: 'bg-status-full-bg text-status-full', avatar: 'bg-status-blocked-bg text-status-blocked' },
}

/** Warna & ikon chip aksi per jenis. */
export const NADA_AKSI: Record<JenisAksi, { chip: string; ikon: string }> = {
  banding: { chip: 'bg-status-available-bg text-status-available', ikon: 'verified' },
  verifikasi: { chip: 'bg-status-available-bg text-status-available', ikon: 'domain_verification' },
  persetujuan_reservasi: { chip: 'bg-status-available-bg text-status-available', ikon: 'check_circle' },
  penonaktifan: { chip: 'bg-status-full-bg text-status-full', ikon: 'block' },
  keamanan: { chip: 'bg-status-full-bg text-status-full', ikon: 'security' },
  pembatalan_reservasi: { chip: 'bg-status-occupied-bg text-status-occupied', ikon: 'history_toggle_off' },
  hapus_riwayat: { chip: 'bg-surface-container text-slate-500', ikon: 'person_remove' },
}

/** Peran aktor untuk payload JSON (KONSTANTA_SISTEM). */
const PERAN_JSON: Record<PeranAktor, string> = {
  admin: 'SUPER_ADMIN',
  penyedia: 'PROVIDER',
  penyewa: 'RENTER',
  sistem: 'SYSTEM_CRON',
  keamanan: 'WAF_SECURITY',
}

/** Rentang tanggal filter cepat. */
export const RENTANG: Record<'0' | '3' | '7' | 'semua', string> = {
  '0': '24 Okt 2026',
  '3': '22 - 24 Okt 2026',
  '7': '18 - 24 Okt 2026',
  semua: 'Semua Waktu',
}

/** Bangun payload JSON sebuah entri — isi modal detail & tombol salin. */
export function payloadJson(l: EntriLog): string {
  return JSON.stringify(
    {
      log_id: l.id,
      timestamp: l.iso,
      actor: {
        role: PERAN_JSON[l.peran],
        name: l.aktor,
        user_id: l.aktorId,
        ip_address_hash: l.ip,
      },
      action: l.kodeAksi,
      target_entity: {
        entity_type: l.entitasJenis,
        entity_id: l.refId,
        business_name: l.entitas,
      },
      decision_details: {
        clause_reference: l.sop,
        notes: l.keterangan,
        metadata: l.meta,
        signature_status: 'READ_ONLY_VERIFIED',
      },
      signature_sha256: l.sha,
    },
    null,
    2,
  )
}

export const ENTRI_AWAL: EntriLog[] = [
  {
    id: 'LOG-9842',
    waktu: '24 Okt 2026, 14:32:10 WIB',
    iso: '2026-10-24T14:32:10.884+07:00',
    hariLalu: 0,
    aktor: 'Admin Utama Sistem',
    inisial: 'AU',
    aktorId: 'ADM-001',
    peran: 'admin',
    aksi: 'Menyetujui Banding (Reaktivasi)',
    jenis: 'banding',
    entitas: 'PT Graha Multi Kreasi',
    refId: 'MITRA-018',
    entitasJenis: 'PROVIDER_ACCOUNT',
    keterangan: 'Sanggahan NIB diterima, penahanan etalase dicabut',
    sop: ['FR-H5', 'FR-G3'],
    meta: 'IP: 182.253.118.xx (Terenkripsi)',
    ip: '182.253.118.xx',
    kodeAksi: 'APPEAL_APPROVED_REACTIVATION',
    sha: '4b9e2c608f09bdf7618991fa9b2447e112d8a0f90c4d9e03a987ef1c098df991',
  },
  {
    id: 'LOG-9839',
    waktu: '24 Okt 2026, 11:15:44 WIB',
    iso: '2026-10-24T11:15:44.201+07:00',
    hariLalu: 0,
    aktor: 'Admin Utama Sistem',
    inisial: 'AU',
    aktorId: 'ADM-001',
    peran: 'admin',
    aksi: 'Menonaktifkan Akun',
    jenis: 'penonaktifan',
    entitas: 'PT Graha Multi Kreasi',
    refId: 'MITRA-018',
    entitasJenis: 'PROVIDER_ACCOUNT',
    keterangan: 'Pelanggaran SOP-09 klausul 4 (inkonsistensi izin). Diberikan hak banding 14 hari',
    sop: ['FR-G2'],
    meta: 'IP: 182.253.118.xx (Terenkripsi)',
    ip: '182.253.118.xx',
    kodeAksi: 'ACCOUNT_SUSPENDED',
    sha: 'c17f84a2d9e30b5168cc42e7a0f3d58b2940e6710fa3c8d54b92e07a6d1c8f34',
  },
  {
    id: 'LOG-9835',
    waktu: '24 Okt 2026, 09:40:02 WIB',
    iso: '2026-10-24T09:40:02.512+07:00',
    hariLalu: 0,
    aktor: 'Admin Utama Sistem',
    inisial: 'AU',
    aktorId: 'ADM-001',
    peran: 'admin',
    aksi: 'Menyetujui Verifikasi Mitra',
    jenis: 'verifikasi',
    entitas: 'PT Sentosa Venue Nusantara',
    refId: 'MITRA-092',
    entitasJenis: 'PROVIDER_ACCOUNT',
    keterangan: 'Bukti foto ballroom & tautan Google Maps valid terverifikasi',
    sop: ['FR-A5', 'FR-G1'],
    meta: 'Klausul: Dokumen Legal & Fisik Lengkap',
    ip: '182.253.118.xx',
    kodeAksi: 'PROVIDER_VERIFIED',
    sha: '9d31e7b8045ca26f1d9380b7c5e4a1f2608d39c7be4510a8d2f6c0937e5b4a18',
  },
  {
    id: 'LOG-9828',
    waktu: '23 Okt 2026, 21:05:18 WIB',
    iso: '2026-10-23T21:05:18.117+07:00',
    hariLalu: 1,
    aktor: 'Hendra Kurniawan',
    inisial: 'HK',
    aktorId: 'MTR-044',
    peran: 'penyedia',
    aksi: 'Menyetujui Reservasi',
    jenis: 'persetujuan_reservasi',
    entitas: 'Horizon Grand Ballroom',
    refId: 'BKG-2026-8819',
    entitasJenis: 'BOOKING',
    keterangan: 'Pembayaran tunai/transfer luar sistem dikonfirmasi valid Rp 15.000.000',
    sop: ['FR-C13'],
    meta: 'ID Nota: INV-2026-00994',
    ip: '114.125.209.xx',
    kodeAksi: 'RESERVATION_APPROVED',
    sha: '2f60d9c15a8be347019cb2d86e5f4a7013d8be29c5047af61d0e93b8c5724f0e',
  },
  {
    id: 'LOG-9810',
    waktu: '23 Okt 2026, 18:00:00 WIB',
    iso: '2026-10-23T18:00:00.000+07:00',
    hariLalu: 1,
    aktor: 'Cron Engine v2.4',
    inisial: 'CE',
    aktorId: 'SYS-CRON-02',
    peran: 'sistem',
    aksi: 'Membatalkan Reservasi (Expired)',
    jenis: 'pembatalan_reservasi',
    entitas: 'The Grand Atrium',
    refId: 'BKG-2026-8804',
    entitasJenis: 'BOOKING',
    keterangan:
      'Batas waktu pending 24 jam terlampaui tanpa konfirmasi penyedia; slot dilepas',
    sop: ['FR-C16'],
    meta: 'Scheduler Job: ExpireUnconfirmedHold',
    ip: '127.0.0.1',
    kodeAksi: 'RESERVATION_EXPIRED',
    sha: '70c4e18d29fa65b30d8e7c14a2f95b6e0318cd74af20e5b913d6c8a7f24b0e51',
  },
  {
    id: 'LOG-9799',
    waktu: '22 Okt 2026, 16:12:09 WIB',
    iso: '2026-10-22T16:12:09.733+07:00',
    hariLalu: 2,
    aktor: 'Admin Utama Sistem',
    inisial: 'AU',
    aktorId: 'ADM-001',
    peran: 'admin',
    aksi: 'Menghapus Riwayat Penyewa',
    jenis: 'hapus_riwayat',
    entitas: 'Akun Nonaktif',
    refId: 'USR-0421',
    entitasJenis: 'USER_ACCOUNT',
    keterangan:
      'Data riwayat disamarkan/dihapus atas permohonan; catatan ringkas audit log tetap disimpan permanen',
    sop: ['FR-G5'],
    meta: 'Hak Privasi & Pseudonimitas GDPR/UU PDP',
    ip: '182.253.118.xx',
    kodeAksi: 'HISTORY_PURGED',
    sha: 'e8520a4719cd36bf0a7d52e91c84f3b6520ea9714d0fb83c265a9e17d04b6f82',
  },
  {
    id: 'LOG-9782',
    waktu: '22 Okt 2026, 14:03:55 WIB',
    iso: '2026-10-22T14:03:55.310+07:00',
    hariLalu: 2,
    aktor: 'Rate Limiter WAF',
    inisial: 'RL',
    aktorId: 'SYS-WAF-01',
    peran: 'keamanan',
    aksi: 'Pembatasan Akses (Rate Limit)',
    jenis: 'keamanan',
    entitas: '103.78.112.44',
    refId: 'JKT-SELATAN-ID',
    entitasJenis: 'IP_ADDRESS',
    keterangan: 'Percobaan registrasi melebihi 5x/jam; diblokir sementara 60 menit',
    sop: ['FR-I2'],
    meta: 'Batas Waktu Buka: 15:03:55 WIB',
    metaNada: 'full',
    ip: '103.78.112.44',
    kodeAksi: 'RATE_LIMIT_BLOCK',
    sha: '5a93fc02e18d746b30a9c25df8164b7e9023da51cf804e6b27d9a310f5c86b47',
  },
  {
    id: 'LOG-9771',
    waktu: '21 Okt 2026, 19:44:02 WIB',
    iso: '2026-10-21T19:44:02.665+07:00',
    hariLalu: 3,
    aktor: 'Sari Rahmawati',
    inisial: 'SR',
    aktorId: 'USR-1188',
    peran: 'penyewa',
    aksi: 'Membatalkan Reservasi (Penyewa)',
    jenis: 'pembatalan_reservasi',
    entitas: 'Ruang Nusa Center',
    refId: 'BKG-2026-8790',
    entitasJenis: 'BOOKING',
    keterangan:
      'Penyewa membatalkan H-2 sebelum jadwal; biaya administrasi 10% sesuai kebijakan',
    sop: ['FR-C14'],
    meta: 'Pengembalian Dana: Rp 1.350.000',
    ip: '36.79.118.xx',
    kodeAksi: 'RESERVATION_CANCELLED',
    sha: 'b4c701e9d25a386f17be04d95c2a8f31609de7b4025af3c81d6e09b7a53f2c16',
  },
  {
    id: 'LOG-9760',
    waktu: '21 Okt 2026, 10:22:31 WIB',
    iso: '2026-10-21T10:22:31.084+07:00',
    hariLalu: 3,
    aktor: 'Admin Utama Sistem',
    inisial: 'AU',
    aktorId: 'ADM-001',
    peran: 'admin',
    aksi: 'Menolak Verifikasi Mitra',
    jenis: 'verifikasi',
    ditolak: true,
    entitas: 'CV Cipta Griya Mandiri',
    refId: 'MITRA-104',
    entitasJenis: 'PROVIDER_ACCOUNT',
    keterangan:
      'Foto ruangan tidak sesuai titik lokasi Google Maps; tautan peta diarahkan ke gedung lain',
    sop: ['FR-A5'],
    meta: 'Dapat mengajukan ulang setelah 14 hari',
    ip: '182.253.118.xx',
    kodeAksi: 'PROVIDER_VERIFICATION_REJECTED',
    sha: '1e68d40b93fa27c50e8b31d7a94c2f65037be1d849a5c0e62f71b3d09a4c5e82',
  },
  {
    id: 'LOG-9752',
    waktu: '20 Okt 2026, 16:58:14 WIB',
    iso: '2026-10-20T16:58:14.902+07:00',
    hariLalu: 4,
    aktor: 'Admin Utama Sistem',
    inisial: 'AU',
    aktorId: 'ADM-001',
    peran: 'admin',
    aksi: 'Menonaktifkan Akun',
    jenis: 'penonaktifan',
    entitas: 'CV Tunas Bangsa Event',
    refId: 'MITRA-077',
    entitasJenis: 'PROVIDER_ACCOUNT',
    keterangan:
      'Tiga laporan pengguna soal fasilitas rusak terkonfirmasi; hak banding 14 hari diberikan',
    sop: ['FR-G2'],
    meta: 'IP: 182.253.118.xx (Terenkripsi)',
    ip: '182.253.118.xx',
    kodeAksi: 'ACCOUNT_SUSPENDED',
    sha: '83ba5e170cd9426f2a07e51d8b3c94f6025de81b7a40f2c93e6d10b58c7a4f29',
  },
  {
    id: 'LOG-9744',
    waktu: '20 Okt 2026, 09:15:47 WIB',
    iso: '2026-10-20T09:15:47.339+07:00',
    hariLalu: 4,
    aktor: 'Yuni Safitri',
    inisial: 'YS',
    aktorId: 'MTR-061',
    peran: 'penyedia',
    aksi: 'Menyetujui Reservasi',
    jenis: 'persetujuan_reservasi',
    entitas: 'Gedung Serbaguna Mekar',
    refId: 'BKG-2026-8766',
    entitasJenis: 'BOOKING',
    keterangan: 'Reservasi aula 12 Nov dikonfirmasi; uang muka 50% tercatat lunas',
    sop: ['FR-C13'],
    meta: 'ID Nota: INV-2026-00971',
    ip: '180.252.116.xx',
    kodeAksi: 'RESERVATION_APPROVED',
    sha: '0c59f3ab71d8462be90a7c25d3f81b46027ea5d913bf04c6827d9e5a1b0f6c83',
  },
  {
    id: 'LOG-9730',
    waktu: '19 Okt 2026, 13:27:55 WIB',
    iso: '2026-10-19T13:27:55.441+07:00',
    hariLalu: 5,
    aktor: 'Cron Engine v2.4',
    inisial: 'CE',
    aktorId: 'SYS-CRON-02',
    peran: 'sistem',
    aksi: 'Membatalkan Reservasi (Expired)',
    jenis: 'pembatalan_reservasi',
    entitas: 'Puri Anggrek Meeting',
    refId: 'BKG-2026-8712',
    entitasJenis: 'BOOKING',
    keterangan: 'Kuota slot dilepas otomatis setelah 24 jam tanpa konfirmasi penyedia',
    sop: ['FR-C16'],
    meta: 'Scheduler Job: ExpireUnconfirmedHold',
    ip: '127.0.0.1',
    kodeAksi: 'RESERVATION_EXPIRED',
    sha: 'df27c0594e1b8a36f20d79ce45b81a3f0692de7b41c850a39e26f0b7d41c5a90',
  },
  {
    id: 'LOG-9718',
    waktu: '19 Okt 2026, 08:44:20 WIB',
    iso: '2026-10-19T08:44:20.128+07:00',
    hariLalu: 5,
    aktor: 'Admin Utama Sistem',
    inisial: 'AU',
    aktorId: 'ADM-001',
    peran: 'admin',
    aksi: 'Menolak Banding',
    jenis: 'banding',
    ditolak: true,
    entitas: 'Agus Salim',
    refId: 'USR-0288',
    entitasJenis: 'USER_ACCOUNT',
    keterangan:
      'Banding ditolak — tunggakan tidak lunas dalam tenggat; penonaktifan permanen berlaku',
    sop: ['FR-H5'],
    meta: 'IP: 182.253.118.xx (Terenkripsi)',
    ip: '182.253.118.xx',
    kodeAksi: 'APPEAL_REJECTED',
    sha: '6b04e8d13a7c925f0e26b48d71c35a9f048de21b75c90a6e3d18f7b05c2e9a41',
  },
  {
    id: 'LOG-9705',
    waktu: '18 Okt 2026, 15:31:08 WIB',
    iso: '2026-10-18T15:31:08.277+07:00',
    hariLalu: 6,
    aktor: 'Rate Limiter WAF',
    inisial: 'RL',
    aktorId: 'SYS-WAF-01',
    peran: 'keamanan',
    aksi: 'Pembatasan Akses (Rate Limit)',
    jenis: 'keamanan',
    entitas: '45.123.88.17',
    refId: 'DEPOK-ID',
    entitasJenis: 'IP_ADDRESS',
    keterangan: 'Percobaan login gagal 8x/jam; sesi diblokir 30 menit',
    sop: ['FR-I2'],
    meta: 'Batas Waktu Buka: 16:01:08 WIB',
    metaNada: 'full',
    ip: '45.123.88.17',
    kodeAksi: 'RATE_LIMIT_BLOCK',
    sha: 'a92d70f41b3c856e029da7f35c81b6e4072f9d3a65c180be742d0f9a3c5b6e17',
  },
]
