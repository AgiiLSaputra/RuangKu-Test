import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AKUN_AWAL,
  BANDING_AWAL,
  type Akun,
  type BandingAkun,
  type PeranAkun,
  type StatusAkun,
} from '../../../data/manajemenAkun'

export type TabAkun = 'semua' | StatusAkun
export type PeranFilter = 'semua' | PeranAkun

/** Kelas dasar tombol pil di halaman Manajemen Akun (kedua varian). */
export const KELAS_TOMBOL =
  'inline-flex items-center justify-center gap-2 rounded-full font-title-md text-title-md font-semibold transition-all active:scale-[0.98]'

/** Inisial nama untuk avatar baris (kata singkat seperti PT/CV dilewati). */
export function inisialNama(nama: string): string {
  const kata = nama
    .split(' ')
    .filter((w) => w.length > 2 && !['pt', 'cv', 'tb', 'persero'].includes(w.toLowerCase()))
  const ambil = kata.length > 0 ? kata : nama.split(' ')
  return ambil
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

/** Jumlah baris tabel per halaman. */
const PER_HALAMAN = 6

/**
 * State halaman Manajemen Akun (FR-G2, FR-G3): tabel akun + pencarian +
 * filter status/peran + paginasi, panel detail akun terpilih (dapat dipreset
 * lewat `?akun=<id>`), keputusan banding dengan catatan wajib, dan
 * penonaktifan permanen lewat modal konfirmasi. Dipakai bersama desktop & mobile.
 */
export function useManajemenAkun() {
  const [params] = useSearchParams()
  const [akun, setAkun] = useState<Akun[]>(AKUN_AWAL)
  const [banding, setBanding] = useState<BandingAkun[]>(BANDING_AWAL)
  const [cari, setCari] = useState('')
  const [tab, setTabState] = useState<TabAkun>('semua')
  const [peran, setPeran] = useState<PeranFilter>('semua')
  const [filterBuka, setFilterBuka] = useState(false)
  const [pilihId, setPilihId] = useState<string>(() => {
    const preset = params.get('akun')
    return AKUN_AWAL.some((a) => a.id === preset) ? preset! : AKUN_AWAL[0].id
  })
  const [halaman, setHalaman] = useState(1)
  const [opsiId, setOpsiId] = useState<string | null>(null)
  const [nonaktifId, setNonaktifId] = useState<string | null>(null)
  const [auditBuka, setAuditBuka] = useState(false)
  const [proses, setProses] = useState<string | null>(null)
  const [hasil, setHasil] = useState<{ nada: 'sukses' | 'tolak'; teks: string } | null>(null)
  const [catatan, setCatatan] = useState('')
  const [galat, setGalat] = useState('')
  const [berubah, setBerubah] = useState(false)

  /** Ganti tab filter status — paginasi kembali ke halaman pertama. */
  const setTab = (t: TabAkun) => {
    setTabState(t)
    setHalaman(1)
  }

  /** Ganti filter peran — paginasi kembali ke halaman pertama. */
  const pilihPeran = (p: PeranFilter) => {
    setPeran(p)
    setHalaman(1)
  }

  const cariAkun = (kunci: string) => {
    setCari(kunci)
    setHalaman(1)
  }

  /** Hitung jumlah akun per tab — angka mengikuti keadaan data terkini. */
  const tabHitung = useMemo(() => {
    const hitung = (s: StatusAkun) => akun.filter((a) => a.status === s).length
    return {
      semua: akun.length,
      menunggu: hitung('menunggu'),
      aktif: hitung('aktif'),
      ditolak: hitung('ditolak'),
      nonaktif: hitung('nonaktif'),
    }
  }, [akun])

  /** Akun setelah filter tab + peran + pencarian. */
  const tampil = useMemo(() => {
    const kunci = cari.trim().toLowerCase()
    return akun.filter(
      (a) =>
        (tab === 'semua' || a.status === tab) &&
        (peran === 'semua' || a.peran === peran) &&
        (kunci === '' || `${a.nama} ${a.email} ${a.ref}`.toLowerCase().includes(kunci)),
    )
  }, [akun, tab, peran, cari])

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

  /** Akun yang sedang dibuka di panel detail. */
  const terpilih = akun.find((a) => a.id === pilihId) ?? null
  const opsiAkun = akun.find((a) => a.id === opsiId) ?? null
  const nonaktifAkun = akun.find((a) => a.id === nonaktifId) ?? null
  /** Pengajuan banding milik akun terpilih — tampil di kartu panel detail. */
  const bandingTerpilih = banding.find((b) => b.akunId === pilihId) ?? null
  /** Seluruh banding aktif, terurut sisa waktu paling mendesak di atas. */
  const bandingAktif = useMemo(() => [...banding].sort((a, b) => a.sisaHari - b.sisaHari), [banding])

  /** Buka panel detail sebuah akun + gulir ke panel (dipakai baris tabel & kartu). */
  const prosesBanding = (id: string) => {
    setPilihId(id)
    document.getElementById('panel-akun')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /** Aktifkan kembali sebuah akun — banding terkait ikut ditutup. */
  const aktifkan = (id: string) => {
    const a = akun.find((x) => x.id === id)
    if (!a || proses) return
    setProses(`akun-${id}`)
    window.setTimeout(() => {
      const adaBanding = banding.some((b) => b.akunId === id)
      setAkun((daftar) => daftar.map((x) => (x.id === id ? { ...x, status: 'aktif' } : x)))
      setBanding((daftar) => daftar.filter((b) => b.akunId !== id))
      setHasil({
        nada: 'sukses',
        teks: `Akun ${a.nama} diaktifkan kembali${
          adaBanding ? ' — pengajuan banding terkait dikabulkan dan ditutup' : ''
        }. Pemilik akun menerima notifikasi aktivasi.`,
      })
      setProses(null)
      setOpsiId(null)
      setBerubah(true)
    }, 700)
  }

  const bukaNonaktif = (id: string) => {
    setOpsiId(null)
    setNonaktifId(id)
  }

  /** Konfirmasi penonaktifan permanen dari modal (FR-G2). */
  const konfirmasiNonaktif = () => {
    const a = nonaktifAkun
    if (!a || proses) return
    setProses('nonaktif')
    window.setTimeout(() => {
      setAkun((daftar) => daftar.map((x) => (x.id === a.id ? { ...x, status: 'nonaktif' } : x)))
      setHasil({
        nada: 'tolak',
        teks: `Akun ${a.nama} dinonaktifkan permanen (FR-G2). Seluruh sesi aktif dicabut dan keputusan tercatat di Audit Log.`,
      })
      setProses(null)
      setNonaktifId(null)
      setBerubah(true)
    }, 800)
  }

  /** Putuskan banding aktif — wajib isi catatan keputusan untuk Audit Log (FR-G3). */
  const putusBanding = (setuju: boolean) => {
    const b = bandingTerpilih
    const a = terpilih
    if (!b || !a || proses) return
    if (catatan.trim() === '') {
      setGalat('Tulis catatan keputusan untuk Audit Log sebelum memutus banding.')
      return
    }
    setGalat('')
    setProses(setuju ? 'banding-setuju' : 'banding-tolak')
    window.setTimeout(() => {
      setBanding((daftar) => daftar.filter((x) => x.id !== b.id))
      if (setuju) {
        setAkun((daftar) => daftar.map((x) => (x.id === a.id ? { ...x, status: 'aktif' } : x)))
      }
      setHasil({
        nada: setuju ? 'sukses' : 'tolak',
        teks: setuju
          ? `Banding ${a.nama} disetujui — akun diaktifkan kembali dan layanan dipulihkan. Keputusan tercatat di Audit Log (FR-G3).`
          : `Banding ${a.nama} ditolak — akun tetap nonaktif hingga tenggat peninjauan berakhir. Pemohon menerima rincian lewat email.`,
      })
      setProses(null)
      setCatatan('')
      setBerubah(true)
    }, setuju ? 750 : 850)
  }

  /** Unduh daftar akun hasil filter sebagai CSV (pemisah titik-koma, siap Excel). */
  const eksporCsv = () => {
    const kepala = ['ID Akun', 'Nama', 'Peran', 'Email', 'WhatsApp', 'Terdaftar', 'Status', 'Banding Aktif']
    const isi = tampil.map((a) => [
      a.ref,
      a.nama,
      a.peran === 'penyewa' ? 'Penyewa' : 'Penyedia',
      a.email,
      a.wa,
      a.terdaftar,
      a.status === 'menunggu' ? 'Menunggu Verifikasi' : a.status === 'aktif' ? 'Aktif' : a.status === 'ditolak' ? 'Ditolak' : 'Nonaktif',
      a.bandingId ? 'Ya' : 'Tidak',
    ])
    const csv = [kepala, ...isi]
      .map((baris) => `"${baris.map((sel) => sel.replace(/"/g, '""')).join('"')}"`)
      .join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const tautan = document.createElement('a')
    tautan.href = url
    tautan.download = 'manajemen-akun-ruangku.csv'
    tautan.click()
    URL.revokeObjectURL(url)
  }

  /** Kembalikan akun & banding ke kondisi awal (mode demo). */
  const resetDemo = () => {
    setAkun(AKUN_AWAL)
    setBanding(BANDING_AWAL)
    setCari('')
    setTabState('semua')
    setPeran('semua')
    setHalaman(1)
    setPilihId(AKUN_AWAL[0].id)
    setHasil(null)
    setCatatan('')
    setGalat('')
    setBerubah(false)
  }

  return {
    akun,
    bandingAktif,
    bandingTerpilih,
    terpilih,
    opsiAkun,
    opsiId,
    setOpsiId,
    nonaktifAkun,
    nonaktifId,
    setNonaktifId,
    auditBuka,
    setAuditBuka,
    cari,
    setCari: cariAkun,
    tab,
    setTab,
    tabHitung,
    peran,
    setPeran: pilihPeran,
    filterBuka,
    setFilterBuka,
    tampil,
    halamanTampil,
    ringkasHalaman,
    setHalaman,
    pilih: setPilihId,
    prosesBanding,
    aktifkan,
    bukaNonaktif,
    konfirmasiNonaktif,
    putusBanding,
    proses,
    hasil,
    setHasil,
    catatan,
    setCatatan,
    galat,
    setGalat,
    eksporCsv,
    berubah,
    resetDemo,
  }
}

export type ManajemenAkun = ReturnType<typeof useManajemenAkun>
