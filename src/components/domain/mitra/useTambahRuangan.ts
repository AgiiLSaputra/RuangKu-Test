import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  DRAF,
  MAKS_FOTO,
  OPS_FASILITAS,
  POOL_FOTO,
  type FasilitasDraft,
  type FotoDraft,
  type PaketDraft,
  type TutupKhusus,
} from '../../../data/tambahRuangan'
import { cariDraf, simpanDrafRuangan, type IsiDraf } from '../../../lib/drafRuangan'

/** Label tombol aksi utama per langkah (desktop & mobile sama). */
export const LABEL_AKSI_LANGKAH = [
  'Lanjut ke Harga & Paket',
  'Lanjut ke Jadwal & Ketentuan',
  'Lanjut ke Pratinjau & Rilis',
  'Terbitkan Ruangan Sekarang',
] as const

const PESAN_TERBIT = 'Selamat! Ruangan Anda berhasil diterbitkan.'

/** Label isi tiap langkah wizard — tampil di kartu draf (Pengaturan). */
export const LABEL_LANGKAH = [
  'Informasi Ruangan',
  'Harga & Paket',
  'Jadwal & Ketentuan',
  'Pratinjau & Rilis',
] as const

const formatAngka = (teks: string) => {
  const angka = teks.replace(/\D/g, '')
  return angka === '' ? '' : Number(angka).toLocaleString('id-ID')
}

/**
 * Seluruh state + interaksi wizard Tambah Ruangan (4 langkah),
 * dipakai bersama halaman desktop & mobile (mockup PageTambahRuangan[.Mobile].html).
 */
export function useTambahRuangan() {
  const navigate = useNavigate()

  /** Draf lanjutan lewat URL /ruangan-saya/tambah?draf=<id> — kosong kalau tidak ada. */
  const [params] = useSearchParams()
  const drafAwal = useMemo(() => cariDraf(params.get('draf')), [params])

  const [idDraf, setIdDraf] = useState<string | null>(drafAwal?.id ?? null)
  const [langkah, setLangkah] = useState(drafAwal?.langkah ?? 1)
  const [nama, setNama] = useState(drafAwal?.isi.nama ?? DRAF.nama)
  const [lokasi, setLokasi] = useState(drafAwal?.isi.lokasi ?? DRAF.venue)
  const [provinsi, setProvinsi] = useState(drafAwal?.isi.provinsi ?? '')
  const [linkMaps, setLinkMaps] = useState(drafAwal?.isi.linkMaps ?? '')
  const [kapasitas, setKapasitas] = useState(
    drafAwal ? drafAwal.isi.kapasitas : DRAF.kapasitas ? String(DRAF.kapasitas) : '',
  )
  const [deskripsi, setDeskripsi] = useState(drafAwal?.isi.deskripsi ?? DRAF.deskripsi)
  const [tarif, setTarif] = useState(
    drafAwal ? drafAwal.isi.tarif : DRAF.tarifPerJam ? DRAF.tarifPerJam.toLocaleString('id-ID') : '',
  )
  const [jamBuka, setJamBuka] = useState(drafAwal?.isi.jamBuka ?? DRAF.jamBuka)
  const [jamTutup, setJamTutup] = useState(drafAwal?.isi.jamTutup ?? DRAF.jamTutup)
  const [batasAcara, setBatasAcara] = useState(
    drafAwal ? drafAwal.isi.batasAcara : DRAF.batasAcara ? String(DRAF.batasAcara) : '',
  )
  const [batasAktif, setBatasAktif] = useState(drafAwal?.isi.batasAktif ?? true)
  const [wa, setWa] = useState(drafAwal?.isi.wa ?? DRAF.wa)
  const [foto, setFoto] = useState<FotoDraft[]>(drafAwal?.isi.foto ?? DRAF.foto)
  const [fasilitas, setFasilitas] = useState<FasilitasDraft[]>(drafAwal?.isi.fasilitas ?? DRAF.fasilitas)
  const [opsiFasilitas, setOpsiFasilitas] = useState<FasilitasDraft[]>(drafAwal?.isi.opsiFasilitas ?? OPS_FASILITAS)
  const [tagBaru, setTagBaru] = useState('')
  const [paket, setPaket] = useState<PaketDraft[]>(drafAwal?.isi.paket ?? DRAF.paket)
  const [tutupKhusus, setTutupKhusus] = useState<TutupKhusus[]>(drafAwal?.isi.tutupKhusus ?? DRAF.tutupKhusus)

  const [pesan, setPesan] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const tampilkanPesan = useCallback((teks: string) => {
    setPesan(teks)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setPesan(null), 3000)
  }, [])

  const tarifAngka = useMemo(() => Number(tarif.replace(/\D/g, '')) || 0, [tarif])
  const kapasitasAngka = useMemo(() => Number(kapasitas.replace(/\D/g, '')) || 0, [kapasitas])
  const batasAcaraAngka = useMemo(() => Number(batasAcara.replace(/\D/g, '')) || 0, [batasAcara])

  /**
   * Status kelengkapan tiap langkah wizard — dipakai stepper (centang vs silang)
   * dan untuk memblokir lanjut sebelum langkah terisi penuh.
   */
  const langkahTerisi = useMemo(
    () => [
      foto.length > 0 &&
        nama.trim() !== '' &&
        lokasi.trim() !== '' &&
        provinsi.trim() !== '' &&
        kapasitasAngka > 0 &&
        deskripsi.trim() !== '' &&
        fasilitas.length > 0,
      tarifAngka > 0,
      jamBuka.trim() !== '' && jamTutup.trim() !== '' && batasAcaraAngka > 0 && wa.trim() !== '',
      foto.length > 0 &&
        nama.trim() !== '' &&
        lokasi.trim() !== '' &&
        provinsi.trim() !== '' &&
        kapasitasAngka > 0 &&
        deskripsi.trim() !== '' &&
        fasilitas.length > 0 &&
        tarifAngka > 0 &&
        jamBuka.trim() !== '' &&
        jamTutup.trim() !== '' &&
        batasAcaraAngka > 0 &&
        wa.trim() !== '',
    ],
    [
      foto.length,
      nama,
      lokasi,
      provinsi,
      kapasitasAngka,
      deskripsi,
      fasilitas.length,
      tarifAngka,
      jamBuka,
      jamTutup,
      batasAcaraAngka,
      wa,
    ],
  )

  const keLangkah = useCallback(
    (n: number) => {
      const target = Math.min(4, Math.max(1, n))
      if (target > langkah) {
        const belumTerisi = Array.from(
          { length: target - langkah },
          (_, i) => langkah + i,
        ).find((nomor) => !langkahTerisi[nomor - 1])
        if (belumTerisi) {
          tampilkanPesan(`Lengkapi langkah ${belumTerisi} terlebih dahulu.`)
          return
        }
      }
      setLangkah(target)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [langkah, langkahTerisi, tampilkanPesan],
  )

  /**
   * Simpan isi form sebagai draf di Pengaturan (maksimal 3).
   * Kalau sedang membuka draf lama, draf itu yang diperbarui — tidak memakai slot baru.
   */
  const simpanDraf = useCallback(() => {
    const isi: IsiDraf = {
      nama,
      lokasi,
      provinsi,
      linkMaps,
      kapasitas,
      deskripsi,
      tarif,
      jamBuka,
      jamTutup,
      batasAcara,
      wa,
      batasAktif,
      foto,
      fasilitas,
      opsiFasilitas,
      paket,
      tutupKhusus,
    }
    const hasil = simpanDrafRuangan({
      id: idDraf ?? undefined,
      nama: nama.trim() || 'Draf Tanpa Nama',
      langkah,
      isi,
    })
    if (hasil.ok && !idDraf) setIdDraf(hasil.id)
    tampilkanPesan(hasil.pesan)
  }, [
    idDraf,
    langkah,
    nama,
    lokasi,
    provinsi,
    linkMaps,
    kapasitas,
    deskripsi,
    tarif,
    jamBuka,
    jamTutup,
    batasAcara,
    wa,
    batasAktif,
    foto,
    fasilitas,
    opsiFasilitas,
    paket,
    tutupKhusus,
    tampilkanPesan,
  ])
  const terbitkan = useCallback(() => tampilkanPesan(PESAN_TERBIT), [tampilkanPesan])

  const lanjut = useCallback(() => {
    if (!langkahTerisi[langkah - 1]) {
      tampilkanPesan(`Lengkapi langkah ${langkah} terlebih dahulu.`)
      return
    }
    if (langkah < 4) keLangkah(langkah + 1)
    else terbitkan()
  }, [langkah, langkahTerisi, keLangkah, terbitkan, tampilkanPesan])

  const kembali = useCallback(() => {
    if (langkah > 1) keLangkah(langkah - 1)
    else navigate('/ruangan-saya')
  }, [langkah, keLangkah, navigate])

  const tambahFoto = useCallback(() => {
    setFoto((daftar) => {
      if (daftar.length >= MAKS_FOTO) {
        tampilkanPesan(`Maksimal ${MAKS_FOTO} foto per ruangan.`)
        return daftar
      }
      const indeks = daftar.length - DRAF.foto.length
      const berikutnya = POOL_FOTO[((indeks % POOL_FOTO.length) + POOL_FOTO.length) % POOL_FOTO.length]
      return [...daftar, berikutnya]
    })
  }, [tampilkanPesan])

  const hapusFoto = useCallback((indeks: number) => {
    setFoto((daftar) => daftar.filter((_, i) => i !== indeks))
  }, [])

  const toggleFasilitas = useCallback((opsi: FasilitasDraft) => {
    setFasilitas((daftar) =>
      daftar.some((f) => f.nama === opsi.nama)
        ? daftar.filter((f) => f.nama !== opsi.nama)
        : [...daftar, opsi],
    )
  }, [])

  /** Tambah tag fasilitas baru ke daftar opsi sekaligus langsung terpilih. */
  const tambahTag = useCallback(() => {
    const teks = tagBaru.trim()
    if (!teks) return
    const tag: FasilitasDraft = { nama: teks, ikon: 'local_offer' }
    setOpsiFasilitas((daftar) =>
      daftar.some((f) => f.nama.toLowerCase() === teks.toLowerCase()) ? daftar : [...daftar, tag],
    )
    setFasilitas((daftar) =>
      daftar.some((f) => f.nama.toLowerCase() === teks.toLowerCase()) ? daftar : [...daftar, tag],
    )
    setTagBaru('')
  }, [tagBaru])

  /** Nama tag buatan pengguna (bukan bawaan) — bisa dihapus permanen. */
  const tagKustom = useMemo(
    () => new Set(opsiFasilitas.filter((o) => !OPS_FASILITAS.some((b) => b.nama === o.nama)).map((o) => o.nama)),
    [opsiFasilitas],
  )

  const hapusTag = useCallback((nama: string) => {
    setOpsiFasilitas((daftar) => daftar.filter((f) => f.nama !== nama))
    setFasilitas((daftar) => daftar.filter((f) => f.nama !== nama))
  }, [])

  const hapusPaket = useCallback((id: string) => {
    setPaket((daftar) => daftar.filter((p) => p.id !== id))
  }, [])

  const [bukaFormPaket, setBukaFormPaket] = useState(false)
  const [namaPaket, setNamaPaket] = useState('')
  const [durasiPaket, setDurasiPaket] = useState('')
  const [hargaPaket, setHargaPaket] = useState('')
  const [deskripsiPaket, setDeskripsiPaket] = useState('')

  const ubahHargaPaket = useCallback((teks: string) => setHargaPaket(formatAngka(teks)), [])

  /** Simpan paket harian baru dari form langkah 2. */
  const simpanPaket = useCallback(() => {
    const nama = namaPaket.trim()
    const durasi = Number(durasiPaket.replace(/\D/g, ''))
    const harga = Number(hargaPaket.replace(/\D/g, ''))
    if (!nama || !durasi || !harga) {
      tampilkanPesan('Lengkapi nama, durasi, dan harga paket.')
      return
    }
    setPaket((daftar) => [...daftar, { id: `paket-${Date.now()}`, nama, durasiJam: durasi, harga, deskripsi: deskripsiPaket.trim() }])
    setNamaPaket('')
    setDurasiPaket('')
    setHargaPaket('')
    setDeskripsiPaket('')
    setBukaFormPaket(false)
    tampilkanPesan('Paket harian berhasil ditambahkan.')
  }, [namaPaket, durasiPaket, hargaPaket, deskripsiPaket, tampilkanPesan])

  const hapusTutupKhusus = useCallback((id: string) => {
    setTutupKhusus((daftar) => daftar.filter((t) => t.id !== id))
  }, [])

  const ubahTarif = useCallback((teks: string) => setTarif(formatAngka(teks)), [])

  const sisaSlotFoto = MAKS_FOTO - foto.length

  /** Ringkasan paket untuk kartu pratinjau — mis. "Half Day & Full Day". */
  const ringkasPaket = useMemo(() => {
    if (paket.length === 0) return 'Belum ada paket harian'
    return paket
      .map((p) => (p.durasiJam <= 4 ? 'Half Day' : p.durasiJam <= 8 ? 'Full Day' : `${p.durasiJam} Jam`))
      .join(' & ')
  }, [paket])

  return {
    langkah,
    langkahTerisi,
    keLangkah,
    lanjut,
    kembali,
    simpanDraf,
    pesan,
    nama,
    setNama,
    lokasi,
    setLokasi,
    provinsi,
    setProvinsi,
    linkMaps,
    setLinkMaps,
    kapasitas,
    setKapasitas,
    kapasitasAngka,
    deskripsi,
    setDeskripsi,
    tarif,
    ubahTarif,
    tarifAngka,
    jamBuka,
    setJamBuka,
    jamTutup,
    setJamTutup,
    batasAcara,
    setBatasAcara,
    batasAcaraAngka,
    batasAktif,
    setBatasAktif,
    wa,
    setWa,
    foto,
    tambahFoto,
    hapusFoto,
    sisaSlotFoto,
    fasilitas,
    opsiFasilitas,
    tagKustom,
    toggleFasilitas,
    hapusTag,
    tagBaru,
    setTagBaru,
    tambahTag,
    paket,
    hapusPaket,
    bukaFormPaket,
    setBukaFormPaket,
    namaPaket,
    setNamaPaket,
    durasiPaket,
    setDurasiPaket,
    hargaPaket,
    ubahHargaPaket,
    deskripsiPaket,
    setDeskripsiPaket,
    simpanPaket,
    ringkasPaket,
    tutupKhusus,
    hapusTutupKhusus,
  }
}

export type TambahRuanganForm = ReturnType<typeof useTambahRuangan>
