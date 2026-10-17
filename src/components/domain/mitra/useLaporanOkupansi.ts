import { useMemo, useState } from 'react'
import {
  PERIODE_KUSTOM,
  PERIODA,
  infoRuangan,
  jamTerpesan,
  okupansiPersen,
  type IdPeriode,
  type OkupansiRuangan,
  type PeriodeOkupansi,
} from '../../../data/laporanOkupansi'

/** Angka agregat yang tampil pada 4 kartu metrik + baris total tabel. */
export interface RingkasanOkupansi {
  okupansi: number
  jamTerpesan: number
  kapasitasJam: number
  omzet: number
  disetujui: number
  selesai: number
  pending: number
  batal: number
  trx: number
  /** Ruangan dengan okupansi tertinggi pada filter aktif. */
  favorit: { ruanganId: string; persen: number; trx: number } | null
}

/**
 * State Laporan Okupansi (FR-I1 & FR-C6): pilihan periode, filter kategori
 * ruangan, rentang tanggal kustom, agregasi, dan ekspor CSV.
 * Dipakai bersama oleh varian desktop & mobile.
 */
export function useLaporanOkupansi() {
  const [periode, setPeriode] = useState<IdPeriode>('bulan')
  const [kategori, setKategori] = useState('semua')
  const [filterBuka, setFilterBuka] = useState(false)
  const [rentang, setRentang] = useState({ dari: '2026-10-20', sampai: '2026-10-31' })

  /** Periode aktif — pilihan kustom memakai dataset bulanan + badge dari rentang. */
  const periodeAktif: PeriodeOkupansi = useMemo(() => {
    if (periode !== 'kustom') return PERIODA[periode]
    const rapi = (t: string) => {
      const d = new Date(`${t}T00:00:00`)
      return Number.isNaN(d.getTime())
        ? t
        : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    }
    return {
      ...PERIODE_KUSTOM,
      badge: `Periode: ${rapi(rentang.dari)} - ${rapi(rentang.sampai)}`,
    }
  }, [periode, rentang])

  /** Wrapper string → tipe ketat untuk `SortSelect.onPilih`. */
  const pilihPeriode = (id: string) => setPeriode(id as IdPeriode)

  /** Baris okupansi setelah filter kategori, terurut dari okupansi tertinggi. */
  const ruanganTampil = useMemo(
    () =>
      [...periodeAktif.ruangan]
        .filter((r) => kategori === 'semua' || r.ruanganId === kategori)
        .sort((a, b) => okupansiPersen(b) - okupansiPersen(a)),
    [periodeAktif, kategori],
  )

  /** Agregasi semua baris yang tampil — sumber 4 kartu metrik & total tabel. */
  const ringkasan: RingkasanOkupansi = useMemo(() => {
    const jumlah = (pilih: (r: OkupansiRuangan) => number) =>
      ruanganTampil.reduce((jumlahkan, r) => jumlahkan + pilih(r), 0)
    const jam = jumlah(jamTerpesan)
    const kapasitas = jumlah((r) => r.kapasitasJam)
    const teratas = ruanganTampil[0]
    return {
      okupansi: kapasitas === 0 ? 0 : Math.round((jam / kapasitas) * 1000) / 10,
      jamTerpesan: jam,
      kapasitasJam: kapasitas,
      omzet: jumlah((r) => r.omzet),
      disetujui: jumlah((r) => r.disetujui),
      selesai: jumlah((r) => r.selesai),
      pending: jumlah((r) => r.pending),
      batal: jumlah((r) => r.batal),
      trx: jumlah((r) => r.trx),
      favorit: teratas
        ? { ruanganId: teratas.ruanganId, persen: okupansiPersen(teratas), trx: teratas.trx }
        : null,
    }
  }, [ruanganTampil])

  /** Unduh rincian okupansi sebagai CSV (pemisah titik-koma, siap Excel). */
  const eksporCsv = () => {
    const kepala = [
      'Ruangan',
      'Kategori',
      'Periode',
      'Jam Terpesan',
      'Kapasitas Jam',
      'Okupansi (%)',
      'Disetujui',
      'Selesai',
      'Pending',
      'Dibatalkan',
      'Estimasi Omzet',
      'Transaksi',
    ]
    const isi = ruanganTampil.map((r) => {
      const info = infoRuangan(r.ruanganId)
      return [
        info?.nama ?? r.ruanganId,
        info?.kategori ?? '-',
        periodeAktif.badge.replace('Periode: ', ''),
        String(jamTerpesan(r)),
        String(r.kapasitasJam),
        okupansiPersen(r).toFixed(1),
        String(r.disetujui),
        String(r.selesai),
        String(r.pending),
        String(r.batal),
        String(r.omzet),
        String(r.trx),
      ]
    })
    isi.push([
      'TOTAL AKUMULASI',
      `${ruanganTampil.length} Ruangan`,
      periodeAktif.badge.replace('Periode: ', ''),
      String(ringkasan.jamTerpesan),
      String(ringkasan.kapasitasJam),
      ringkasan.okupansi.toFixed(1),
      String(ringkasan.disetujui),
      String(ringkasan.selesai),
      String(ringkasan.pending),
      String(ringkasan.batal),
      String(ringkasan.omzet),
      String(ringkasan.trx),
    ])
    const csv = [kepala, ...isi]
      .map((kolom) => `"${kolom.map((sel) => sel.replace(/"/g, '""')).join('"')}"`)
      .join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const tautan = document.createElement('a')
    tautan.href = url
    tautan.download = 'laporan-okupansi.csv'
    tautan.click()
    URL.revokeObjectURL(url)
  }

  return {
    periode,
    pilihPeriode,
    periodeAktif,
    kategori,
    setKategori,
    filterBuka,
    setFilterBuka,
    rentang,
    setRentang,
    ruanganTampil,
    ringkasan,
    eksporCsv,
  }
}

export type LaporanOkupansi = ReturnType<typeof useLaporanOkupansi>
