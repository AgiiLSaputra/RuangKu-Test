import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useBookings } from '../../../context/BookingContext'
import { cariRuangan, type Reservasi, type Ruangan } from '../../../data/seed'
import { PIC_PENGELOLA, STRUK, WA_PENGELOLA, type Struk } from '../../../data/struk'
import { BIAYA_LAYANAN } from './konstanta'
import { STATUS_STRUK, jamBerikutnya, labelTanggal, terbitSekarang, waTampil } from './utilStruk'

export interface StrukReservasi {
  kode: string
  seri: string
  nilaiValidasi: string
  terbit: string
  status: { teks: string; badge: string; dot: boolean }
  banner: string
  ruangan: Ruangan
  tanggalLabel: string
  jam: string
  durasi: string
  steril: string
  penyewa: string
  acara: string
  jumlahPeserta: number
  skema: string
  tarifLabel: string
  tarifNilai: number
  diskon: number
  promo: string | null
  biayaLayanan: number
  total: number
  pic: string
  waNomor: string
  waTeks: string
}

function susun(r: Reservasi, ruangan: Ruangan): StrukReservasi {
  const digits = r.kode.replace(/\D/g, '') || '00000'
  const status = STATUS_STRUK[r.status]
  const promo = r.promo ?? null
  const tarif = r.total + (r.diskon ?? 0) - BIAYA_LAYANAN

  return {
    kode: r.kode,
    seri: `RK-2026-${digits.slice(-5)}`,
    nilaiValidasi: `RK-2026-${digits.slice(-5)}-VAL`,
    terbit: terbitSekarang(),
    status: { teks: status.teks, badge: status.badge, dot: status.dot },
    banner: status.banner,
    ruangan,
    tanggalLabel: labelTanggal(r.tanggal),
    jam: `${r.jamMulai} - ${r.jamSelesai}`,
    durasi: `${r.durasiJam} Jam`,
    steril: `${r.jamSelesai} - ${jamBerikutnya(r.jamSelesai, 2)} WIB`,
    penyewa: r.penyewa,
    acara: r.acara,
    jumlahPeserta: r.jumlahPeserta,
    skema: r.skema,
    tarifLabel: `Tarif Sewa Ruangan (${r.skema})`,
    tarifNilai: tarif,
    diskon: r.diskon ?? 0,
    promo,
    biayaLayanan: BIAYA_LAYANAN,
    total: r.total,
    pic: PIC_PENGELOLA,
    waNomor: waTampil(ruangan.waPenyedia),
    waTeks: `Halo ${PIC_PENGELOLA}, saya ${r.penyewa} ingin mengonfirmasi pembayaran reservasi ruangan ${r.kode}.`,
  }
}

/** Baris riwayat statis (`data/struk.ts`) → ruangan sintetis untuk halaman struk. */
function ruanganStatis(s: Struk): Ruangan {
  const kapasitasMax = Number.parseInt(s.kapasitas.replace(/\D/g, ''), 10) || 0
  return {
    id: `statis-${s.kode}`,
    kode: s.kode,
    nama: s.nama,
    gedung: s.nama,
    alamat: '-',
    kota: '-',
    kategori: kapasitasMax >= 100 ? 'Ballroom' : 'Meeting Room',
    kapasitasMin: 1,
    kapasitasMax,
    luas: 0,
    tarifPerJam: 0,
    paket: [],
    fasilitas: [],
    deskripsi: '',
    penyedia: 'PT Graha Multi Kreasi',
    waPenyedia: WA_PENGELOLA,
    rating: 0,
    ulasan: 0,
    foto: [],
    jamBuka: '08:00',
    jamTutup: '22:00',
  }
}

/** Struk statis riwayat → data halaman struk (`/struk/:kode`), tanpa reservasi di context. */
function susunStatis(s: Struk): StrukReservasi {
  const banner =
    Object.values(STATUS_STRUK).find((v) => v.teks === s.status.teks)?.banner ??
    'Struk Reservasi Resmi RuangKu'
  const skema = s.tarifLabel.match(/\((.*)\)/)?.[1] ?? s.durasi
  const jumlahPeserta = Number.parseInt(s.kapasitas.replace(/\D/g, ''), 10) || 0

  return {
    kode: s.kode,
    seri: s.seri,
    nilaiValidasi: s.barcode ?? `${s.seri}-VAL`,
    terbit: s.terbit,
    status: { teks: s.status.teks, badge: s.status.badge, dot: s.status.dot },
    banner,
    ruangan: ruanganStatis(s),
    tanggalLabel: s.tanggal,
    jam: s.jam,
    durasi: s.durasi,
    steril: s.steril,
    penyewa: s.penyewa ?? 'Alana Pradita',
    acara: s.keperluan,
    jumlahPeserta,
    skema,
    tarifLabel: s.tarifLabel,
    tarifNilai: s.tarifNilai,
    diskon: 0,
    promo: null,
    biayaLayanan: 0,
    total: s.total,
    pic: PIC_PENGELOLA,
    waNomor: waTampil(WA_PENGELOLA),
    waTeks: s.waTeks,
  }
}

/**
 * Resolusi `/struk/:kode` → data struk lengkap (FR-E1).
 * Prioritas: reservasi (BookingContext) + ruangan (seed), lalu baris statis `STRUK`;
 * `null` bila kode tidak ditemukan.
 */
export function useStrukReservasi(): StrukReservasi | null {
  const { kode } = useParams()
  const { byKode } = useBookings()

  return useMemo(() => {
    if (!kode) return null
    const reservasi = byKode(kode)
    if (reservasi) {
      const ruangan = cariRuangan(reservasi.ruanganId)
      if (!ruangan) return null
      return susun(reservasi, ruangan)
    }
    const statis = STRUK.find((s) => s.kode === kode)
    return statis ? susunStatis(statis) : null
  }, [kode, byKode])
}
