import { useMemo, useState } from 'react'
import {
  ENTRI_AWAL,
  JENIS_AKSI,
  payloadJson,
  type EntriLog,
  type JenisAksi,
  type PeranAktor,
} from '../../../data/auditLog'

export type RentangWaktu = '0' | '3' | '7' | 'semua'

/** Kelas dasar tombol pil di halaman Audit Log (kedua varian). */
export const KELAS_TOMBOL =
  'inline-flex items-center justify-center gap-2 rounded-full font-title-md text-title-md font-semibold transition-all active:scale-[0.98]'

/** Jumlah baris tabel per halaman. */
const PER_HALAMAN = 7

/** Batas hari sejak 24 Okt 2026 per rentang filter — '0' hanya hari ini. */
const BATAS_HARI: Record<RentangWaktu, number> = { '0': 0, '3': 2, '7': 6, semua: 9999 }

/** Entri termasuk kategori "Perubahan Kritis" (chip cepat). */
const kritis = (l: EntriLog) =>
  l.jenis === 'penonaktifan' || l.jenis === 'keamanan' || Boolean(l.ditolak)

/** Entri termasuk filter cepat "Mitra NIB & Izin". */
const nib = (l: EntriLog) =>
  l.entitasJenis === 'PROVIDER_ACCOUNT' &&
  /nib|izin|legal/i.test(`${l.keterangan} ${l.meta}`)

/**
 * State halaman Audit Log (SOP FR-I1, FR-G4, FR-G5): pencarian multi-kolom +
 * filter rentang/jenis/peran + chip cepat + paginasi, modal payload JSON per
 * entri dengan salin ke papan klip, dan ekspor CSV hasil filter.
 */
export function useAuditLog() {
  const [data] = useState<EntriLog[]>(ENTRI_AWAL)
  const [cari, setCari] = useState('')
  const [rentang, setRentang] = useState<RentangWaktu>('7')
  const [jenis, setJenis] = useState<JenisAksi | 'semua'>('semua')
  const [peran, setPeran] = useState<PeranAktor | 'semua'>('semua')
  const [kritisOnly, setKritisOnly] = useState(false)
  const [nibOnly, setNibOnly] = useState(false)
  const [halaman, setHalaman] = useState(1)
  const [entriDipilih, setEntriDipilih] = useState<EntriLog | null>(null)
  const [tersalin, setTersalin] = useState(false)

  const tampil = useMemo(() => {
    const kunci = cari.trim().toLowerCase()
    return data.filter(
      (l) =>
        l.hariLalu <= BATAS_HARI[rentang] &&
        (jenis === 'semua' || l.jenis === jenis) &&
        (peran === 'semua' || l.peran === peran) &&
        (!kritisOnly || kritis(l)) &&
        (!nibOnly || nib(l)) &&
        (kunci === '' ||
          `${l.id} ${l.aktor} ${l.entitas} ${l.refId} ${l.keterangan} ${l.meta}`
            .toLowerCase()
            .includes(kunci)),
    )
  }, [data, cari, rentang, jenis, peran, kritisOnly, nibOnly])

  const jumlahHalaman = Math.max(1, Math.ceil(tampil.length / PER_HALAMAN))
  const halamanEfektif = Math.min(halaman, jumlahHalaman)
  const halamanTampil = tampil.slice(
    (halamanEfektif - 1) * PER_HALAMAN,
    halamanEfektif * PER_HALAMAN,
  )
  const ringkasHalaman = {
    dari: tampil.length === 0 ? 0 : (halamanEfektif - 1) * PER_HALAMAN + 1,
    sampai: halamanEfektif * PER_HALAMAN,
    total: tampil.length,
    halaman: halamanEfektif,
    jumlahHalaman,
  }

  /** Ganti pencarian/filter — paginasi kembali ke halaman pertama. */
  const diUlang = <A extends unknown[]>(fn: (...args: A) => void) => (...args: A) => {
    fn(...args)
    setHalaman(1)
  }

  const cariLog = diUlang((kunci: string) => setCari(kunci))
  const pilihRentang = diUlang((r: RentangWaktu) => setRentang(r))
  const pilihJenis = diUlang((j: JenisAksi | 'semua') => setJenis(j))
  const pilihPeran = diUlang((p: PeranAktor | 'semua') => setPeran(p))
  const toggleKritis = diUlang(() => setKritisOnly((v) => !v))
  const toggleNib = diUlang(() => setNibOnly((v) => !v))

  /** Angka kartu statistik — turunan seluruh entri (bukan hasil filter). */
  const ringkas = useMemo(
    () => ({
      total: data.length,
      admin: data.filter((l) => l.peran === 'admin').length,
      reservasi: data.filter(
        (l) => l.jenis === 'persetujuan_reservasi' || l.jenis === 'pembatalan_reservasi',
      ).length,
      anomali: data.filter((l) => l.jenis === 'penonaktifan' || l.jenis === 'keamanan').length,
    }),
    [data],
  )

  /** Kembalikan seluruh filter ke kondisi awal. */
  const resetFilter = () => {
    setCari('')
    setRentang('7')
    setJenis('semua')
    setPeran('semua')
    setKritisOnly(false)
    setNibOnly(false)
    setHalaman(1)
  }

  /** Salin payload JSON entri terpilih ke papan klip (mode demo). */
  const salinJson = () => {
    if (!entriDipilih) return
    void navigator.clipboard?.writeText(payloadJson(entriDipilih))
    setTersalin(true)
    window.setTimeout(() => setTersalin(false), 1800)
  }

  /** Unduh entri hasil filter sebagai CSV (pemisah titik-koma, siap Excel). */
  const eksporCsv = () => {
    const kepala = [
      'ID Log',
      'Waktu',
      'Aktor',
      'Peran',
      'Aksi',
      'Jenis',
      'Entitas',
      'Referensi',
      'Keterangan',
      'Meta',
      'SHA-256',
    ]
    const isi = tampil.map((l) => [
      l.id,
      l.waktu,
      l.aktor,
      l.peran,
      l.aksi,
      JENIS_AKSI[l.jenis],
      l.entitas,
      `#${l.refId}`,
      `${l.keterangan} (${l.sop.join(', ')})`,
      l.meta,
      l.sha,
    ])
    const csv = [kepala, ...isi]
      .map((baris) => `"${baris.map((sel) => sel.replace(/"/g, '""')).join('"')}"`)
      .join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const tautan = document.createElement('a')
    tautan.href = url
    tautan.download = 'audit-log-ruangku.csv'
    tautan.click()
    URL.revokeObjectURL(url)
  }

  return {
    cari,
    setCari: cariLog,
    rentang,
    setRentang: pilihRentang,
    jenis,
    setJenis: pilihJenis,
    peran,
    setPeran: pilihPeran,
    kritisOnly,
    toggleKritis,
    nibOnly,
    toggleNib,
    tampil,
    halamanTampil,
    ringkasHalaman,
    setHalaman,
    ringkas,
    resetFilter,
    entriDipilih,
    setEntriDipilih,
    payloadTerpilih: entriDipilih ? payloadJson(entriDipilih) : null,
    tersalin,
    salinJson,
    eksporCsv,
  }
}

export type AuditLog = ReturnType<typeof useAuditLog>
