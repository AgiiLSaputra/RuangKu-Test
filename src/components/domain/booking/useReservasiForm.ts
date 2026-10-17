import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBookings } from '../../../context/BookingContext'
import { RUANGAN, cariRuangan, type Ruangan } from '../../../data/seed'
import {
  BIAYA_LAYANAN,
  DISKON_PROMO,
  DURASI_JAM,
  HARGA_PAKET,
  JAM_MULAI,
  JAM_SELESAI,
  KODE_PROMO_VALID,
  RUANGAN_DEFAULT,
  SKEMA_PAKET,
  TANGGAL_ISO,
} from './konstanta'
import { useSlotHold } from './useSlotHold'

export type TipePenyewa = 'perorangan' | 'perusahaan'
export type StatusPromo = 'idle' | 'sukses' | 'galat'

const CATATAN_DEFAULT =
  'Mohon dipersiapkan 4 wireless mic, konektor HDMI & Type-C untuk proyektor panggung utama, serta ruang transit VIP.'

interface OpsiForm {
  /** Teks awal textarea catatan (mockup desktop & mobile sedikit berbeda). */
  catatanAwal?: string
}

/**
 * Seluruh state + interaksi FormulirReservasi (desktop & mobile).
 * Mockup lama 0 JS — semua tombol di-wire di sini (RENCANA 3 & 4D5).
 */
export function useReservasiForm(options: OpsiForm = {}) {
  const params = useParams()
  const navigate = useNavigate()
  const { buat } = useBookings()
  const hold = useSlotHold()

  const roomId = params.roomId ?? RUANGAN_DEFAULT
  const ruangan: Ruangan = cariRuangan(roomId) ?? RUANGAN[0]

  const [tipe, setTipe] = useState<TipePenyewa>('perusahaan')
  const [nama, setNama] = useState('Alana Pradita Santoso')
  const [email, setEmail] = useState('alana.pradita@innovasia.co.id')
  const [wa, setWa] = useState('812-8901-2345')
  const [perusahaan, setPerusahaan] = useState('PT Innovasia Digital Nusantara')
  const [namaAcara, setNamaAcara] = useState('Nusantara Tech Leaders Summit 2026: AI Transformation')
  const [jenisAcara, setJenisAcara] = useState('Seminar / Konferensi')
  const [jumlahTamu, setJumlahTamu] = useState('280')
  const [tataLetak, setTataLetak] = useState('theater')
  const [catatan, setCatatan] = useState(options.catatanAwal ?? CATATAN_DEFAULT)

  const [kodePromo, setKodePromo] = useState('')
  const [promo, setPromo] = useState<{ status: StatusPromo; pesan: string }>({ status: 'idle', pesan: '' })
  const [diskon, setDiskon] = useState(0)

  const [setuju, setSetuju] = useState(true)
  const [galat, setGalat] = useState<string | null>(null)

  const totalTamu = Number(jumlahTamu) || 0

  const galatTamu = useMemo(() => {
    if (jumlahTamu.trim() === '') return 'Jumlah tamu wajib diisi.'
    if (totalTamu > ruangan.kapasitasMax)
      return `Jumlah tamu melebihi batas aman kuota (Maks. ${ruangan.kapasitasMax} orang sesuai izin gedung)`
    if (totalTamu < ruangan.kapasitasMin)
      return `Jumlah tamu kurang dari kapasitas minimum ruangan (Min. ${ruangan.kapasitasMin} orang)`
    return null
  }, [jumlahTamu, totalTamu, ruangan.kapasitasMax, ruangan.kapasitasMin])

  const total = HARGA_PAKET - diskon + BIAYA_LAYANAN

  const keRuangan = useCallback(() => navigate(`/ruangan/${roomId}`), [navigate, roomId])

  const terapkanPromo = useCallback(() => {
    const kode = kodePromo.trim().toUpperCase()
    if (!kode) {
      setDiskon(0)
      setPromo({ status: 'galat', pesan: 'Masukkan kode promo terlebih dahulu.' })
      return
    }
    if (kode === KODE_PROMO_VALID) {
      setDiskon(Math.round(HARGA_PAKET * DISKON_PROMO))
      setPromo({ status: 'sukses', pesan: `Kode ${KODE_PROMO_VALID} diterapkan — diskon 10%.` })
      return
    }
    setDiskon(0)
    setPromo({ status: 'galat', pesan: 'Kode tidak valid' })
  }, [kodePromo])

  const konfirmasi = useCallback(() => {
    if (!setuju) {
      setGalat('Anda harus menyetujui Syarat & Ketentuan Reservasi sebelum konfirmasi.')
      return
    }
    if (galatTamu) {
      setGalat(galatTamu)
      return
    }
    if (!nama.trim() || !email.trim() || !wa.trim() || !namaAcara.trim()) {
      setGalat('Lengkapi semua kolom bertanda * sebelum konfirmasi reservasi.')
      return
    }
    if (tipe === 'perusahaan' && !perusahaan.trim()) {
      setGalat('Nama Perusahaan / Instansi wajib diisi untuk tipe penyewa ini.')
      return
    }
    setGalat(null)
    const baru = buat({
      ruanganId: ruangan.id,
      tanggal: TANGGAL_ISO,
      jamMulai: JAM_MULAI,
      jamSelesai: JAM_SELESAI,
      durasiJam: DURASI_JAM,
      skema: SKEMA_PAKET,
      total,
      status: 'pending',
      penyewa: nama.trim(),
      jumlahPeserta: totalTamu,
      acara: namaAcara.trim(),
      diskon,
      promo: promo.status === 'sukses' ? kodePromo.trim().toUpperCase() : undefined,
    })
    navigate(`/struk/${baru.kode}`)
  }, [
    setuju,
    galatTamu,
    nama,
    email,
    wa,
    namaAcara,
    tipe,
    perusahaan,
    buat,
    ruangan.id,
    total,
    diskon,
    promo.status,
    kodePromo,
    totalTamu,
    navigate,
  ])

  return {
    roomId,
    ruangan,
    hold,
    tipe,
    setTipe,
    nama,
    setNama,
    email,
    setEmail,
    wa,
    setWa,
    perusahaan,
    setPerusahaan,
    namaAcara,
    setNamaAcara,
    jenisAcara,
    setJenisAcara,
    jumlahTamu,
    setJumlahTamu,
    tataLetak,
    setTataLetak,
    catatan,
    setCatatan,
    kodePromo,
    setKodePromo,
    promo,
    diskon,
    terapkanPromo,
    setuju,
    setSetuju,
    galat,
    setGalat,
    galatTamu,
    total,
    keRuangan,
    konfirmasi,
  }
}

export type ReservasiForm = ReturnType<typeof useReservasiForm>
