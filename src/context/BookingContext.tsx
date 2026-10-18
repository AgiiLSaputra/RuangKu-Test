import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { RESERVASI, type Reservasi, type StatusReservasi } from '../data/seed'

interface BookingValue {
  daftar: Reservasi[]
  byKode: (kode: string) => Reservasi | undefined
  buat: (r: Omit<Reservasi, 'kode'> & { kode?: string }) => Reservasi
  ubahStatus: (kode: string, status: StatusReservasi) => void
}

const BookingContext = createContext<BookingValue | null>(null)

/** Penyimpanan sesi supaya struk tetap ada walau halaman dimuat ulang. */
const KEY = 'ruangku.reservasi'

function muatReservasi(): Reservasi[] {
  try {
    const mentah = sessionStorage.getItem(KEY)
    if (!mentah) return RESERVASI
    const tersimpan: unknown = JSON.parse(mentah)
    return Array.isArray(tersimpan) && tersimpan.length > 0 ? (tersimpan as Reservasi[]) : RESERVASI
  } catch {
    return RESERVASI
  }
}

function kodeBaru(): string {
  return `RK-${Math.floor(10000 + Math.random() * 89999)}-RUANGKU`
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [daftar, setDaftar] = useState<Reservasi[]>(muatReservasi)

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(daftar))
    } catch {
      /* penyimpanan tidak tersedia — data cukup di memori */
    }
  }, [daftar])

  const buat = useCallback((r: Omit<Reservasi, 'kode'> & { kode?: string }) => {
    const baru: Reservasi = { ...r, kode: r.kode ?? kodeBaru() }
    setDaftar((prev) => [baru, ...prev])
    return baru
  }, [])

  const ubahStatus = useCallback((kode: string, status: StatusReservasi) => {
    setDaftar((prev) => prev.map((r) => (r.kode === kode ? { ...r, status } : r)))
  }, [])

  const byKode = useCallback((kode: string) => daftar.find((r) => r.kode === kode), [daftar])

  const value = useMemo(() => ({ daftar, byKode, buat, ubahStatus }), [daftar, byKode, buat, ubahStatus])

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBookings(): BookingValue {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBookings harus dipakai di dalam <BookingProvider>')
  return ctx
}
