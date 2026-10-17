import { useMemo } from 'react'
import { useBookings } from '../../../context/BookingContext'
import { PESANAN, type Pesanan } from '../../../data/pesanan'
import { STRUK, type Struk } from '../../../data/struk'
import { reservasiKePesanan, reservasiKeStruk } from './mapperReservasi'

/**
 * Daftar struk gabungan: reservasi pengguna (urutan paling atas) + `STRUK` statis
 * yang kodenya belum terpakai. Dipakai Pusat Struk (`/struk`, desktop + mobile).
 */
export function useDaftarStruk(): Struk[] {
  const { daftar } = useBookings()

  return useMemo(() => {
    const dariReservasi = daftar.map(reservasiKeStruk).filter((s): s is Struk => s !== null)
    const kodeTerpakai = new Set(dariReservasi.map((s) => s.kode))
    return [...dariReservasi, ...STRUK.filter((s) => !kodeTerpakai.has(s.kode))]
  }, [daftar])
}

/** Pola sama dengan `useDaftarStruk` untuk kartu Riwayat Pemesanan (`/pesanan`). */
export function useDaftarPesanan(): Pesanan[] {
  const { daftar } = useBookings()

  return useMemo(() => {
    const dariReservasi = daftar.map(reservasiKePesanan).filter((p): p is Pesanan => p !== null)
    const kodeTerpakai = new Set(dariReservasi.map((p) => p.kode))
    return [...dariReservasi, ...PESANAN.filter((p) => !kodeTerpakai.has(p.kode))]
  }, [daftar])
}
