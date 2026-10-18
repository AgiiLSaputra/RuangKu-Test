import { LISTING } from './ruanganSaya'

/** Pilihan periode laporan pada dropdown. */
export type IdPeriode = 'minggu' | 'bulan' | 'kuartal' | 'kustom'

/** Baris okupansi satu ruangan pada satu periode. */
export interface OkupansiRuangan {
  ruanganId: string
  /** Jam terpesan terurai (reguler + paket) — dipakai perhitungan & rincian. */
  jamReguler: number
  jamPaket: number
  /** Kapasitas jam operasional ruangan pada periode (hari × jam buka). */
  kapasitasJam: number
  disetujui: number
  selesai: number
  pending: number
  batal: number
  omzet: number
  trx: number
  /** Label rincian jam opsional — bila kosong dipakai otomatis. */
  labelJam?: string
}

export interface PeriodeOkupansi {
  id: IdPeriode
  label: string
  /** Badge periode pada judul grafik. */
  badge: string
  /** Delta okupansi + pembandingnya. */
  delta: string
  deltaVs: string
  ruangan: OkupansiRuangan[]
}

export const jamTerpesan = (r: OkupansiRuangan) => r.jamReguler + r.jamPaket

export const okupansiPersen = (r: OkupansiRuangan) =>
  r.kapasitasJam === 0 ? 0 : Math.round((jamTerpesan(r) / r.kapasitasJam) * 1000) / 10

export const rincianJam = (r: OkupansiRuangan) =>
  r.labelJam ?? `${r.jamReguler}j Reguler + ${r.jamPaket}j Paket`

/** Info listing mitra (`nama`, `lokasi`, `pax`, `foto`, `kategori`, `status`). */
export const infoRuangan = (id: string) => LISTING.find((l) => l.id === id)

/** "Lantai • Gedung • Pax" untuk baris grafik & kartu. */
export const lantaiPax = (id: string) => {
  const info = infoRuangan(id)
  return info ? `${info.lokasi} • ${info.pax} Pax` : ''
}

/** Chip peringatan untuk ruangan yang sedang ditangguhkan (status `tenggang`). */
export const catatanRuangan = (id: string) =>
  infoRuangan(id)?.status === 'tenggang' ? 'Masa Pemeliharaan Ringan' : null

/** Opsi filter kategori ruangan (diambil dari listing mitra). */
export const OPSI_KATEGORI = [
  { id: 'semua', label: 'Semua Ruangan' },
  ...LISTING.map((l) => ({ id: l.id, label: l.kategori })),
]

/** Opsi dropdown periode — label singkat agar muat di tombol & menu. */
export const OPSI_PERIODE: Array<{ id: IdPeriode; label: string }> = [
  { id: 'minggu', label: 'Minggu Ini' },
  { id: 'bulan', label: 'Bulan Ini (Okt 2026)' },
  { id: 'kuartal', label: 'Kuartal IV (Q4 2026)' },
  { id: 'kustom', label: 'Rentang Kustom' },
]

const RUANGAN_BULAN: OkupansiRuangan[] = [
  {
    ruanganId: 'horizon-grand-ballroom',
    jamReguler: 82,
    jamPaket: 24,
    kapasitasJam: 120,
    disetujui: 14,
    selesai: 8,
    pending: 2,
    batal: 1,
    omzet: 26_500_000,
    trx: 22,
    labelJam: '82j Reguler + 24j Full-day',
  },
  {
    ruanganId: 'grand-atrium-convention-hall',
    jamReguler: 43,
    jamPaket: 16,
    kapasitasJam: 80,
    disetujui: 6,
    selesai: 5,
    pending: 1,
    batal: 0,
    omzet: 9_800_000,
    trx: 11,
    labelJam: '43j Reguler + 16j Paket',
  },
  {
    ruanganId: 'executive-boardroom-suite-a',
    jamReguler: 41,
    jamPaket: 0,
    kapasitasJam: 60,
    disetujui: 8,
    selesai: 4,
    pending: 0,
    batal: 1,
    omzet: 4_100_000,
    trx: 12,
    labelJam: '41j Sewa Jam-Jaman',
  },
  {
    ruanganId: 'skyline-creative-hub',
    jamReguler: 18,
    jamPaket: 0,
    kapasitasJam: 40,
    disetujui: 3,
    selesai: 1,
    pending: 1,
    batal: 0,
    omzet: 2_100_000,
    trx: 4,
    labelJam: '18j Sesi Kreatif Reguler',
  },
]

/** Dataset mock tiap periode (Bulan Ini = angka mockup Laporan.html). */
export const PERIODA: Record<Exclude<IdPeriode, 'kustom'>, PeriodeOkupansi> = {
  minggu: {
    id: 'minggu',
    label: 'Minggu Ini (12 - 18 Okt 2026)',
    badge: 'Periode: 12 - 18 Okt 2026',
    delta: '+2.1%',
    deltaVs: 'vs minggu lalu',
    ruangan: [
      { ruanganId: 'horizon-grand-ballroom', jamReguler: 17, jamPaket: 4, kapasitasJam: 30, disetujui: 4, selesai: 2, pending: 1, batal: 0, omzet: 6_350_000, trx: 5 },
      { ruanganId: 'grand-atrium-convention-hall', jamReguler: 9, jamPaket: 4, kapasitasJam: 20, disetujui: 2, selesai: 1, pending: 0, batal: 0, omzet: 2_750_000, trx: 3 },
      { ruanganId: 'executive-boardroom-suite-a', jamReguler: 9, jamPaket: 0, kapasitasJam: 15, disetujui: 2, selesai: 1, pending: 0, batal: 0, omzet: 900_000, trx: 2 },
      { ruanganId: 'skyline-creative-hub', jamReguler: 5, jamPaket: 0, kapasitasJam: 10, disetujui: 1, selesai: 0, pending: 1, batal: 0, omzet: 450_000, trx: 1 },
    ],
  },
  bulan: {
    id: 'bulan',
    label: 'Bulan Ini (Oktober 2026)',
    badge: 'Periode: 1 - 31 Okt 2026',
    delta: '+5.2%',
    deltaVs: 'vs bulan September',
    ruangan: RUANGAN_BULAN,
  },
  kuartal: {
    id: 'kuartal',
    label: 'Kuartal IV (Q4 2026)',
    badge: 'Periode: Okt - Des 2026',
    delta: '+8.4%',
    deltaVs: 'vs Kuartal III',
    ruangan: [
      { ruanganId: 'horizon-grand-ballroom', jamReguler: 246, jamPaket: 66, kapasitasJam: 360, disetujui: 41, selesai: 26, pending: 4, batal: 2, omzet: 79_500_000, trx: 66 },
      { ruanganId: 'grand-atrium-convention-hall', jamReguler: 132, jamPaket: 44, kapasitasJam: 240, disetujui: 19, selesai: 15, pending: 2, batal: 1, omzet: 29_400_000, trx: 33 },
      { ruanganId: 'executive-boardroom-suite-a', jamReguler: 121, jamPaket: 0, kapasitasJam: 180, disetujui: 24, selesai: 13, pending: 1, batal: 2, omzet: 12_300_000, trx: 36 },
      { ruanganId: 'skyline-creative-hub', jamReguler: 58, jamPaket: 0, kapasitasJam: 120, disetujui: 9, selesai: 4, pending: 2, batal: 1, omzet: 6_300_000, trx: 12 },
    ],
  },
}

/** Rentang kustom memakai dataset Bulan Ini — badge periode diisi oleh halaman. */
export const PERIODE_KUSTOM: PeriodeOkupansi = {
  ...PERIODA.bulan,
  id: 'kustom',
  label: 'Rentang Kustom',
  badge: 'Periode: 20 - 31 Okt 2026',
  deltaVs: 'vs periode sebelumnya',
}

/** Nama tenant pada chip breadcrumb halaman laporan. */
export const TENANT = 'PT Graha Multi Kreasi'
