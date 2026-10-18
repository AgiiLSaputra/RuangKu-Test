import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Peran = 'penyewa' | 'penyedia' | 'admin'
export type StatusAkun = 'aktif' | 'menunggu' | 'ditolak' | 'nonaktif'

export interface Pengguna {
  nama: string
  email: string
  peran: Peran
  status: StatusAkun
  terverifikasi: boolean
}

interface AuthValue {
  user: Pengguna | null
  /** Dipakai halaman publik untuk memutuskan modal wajib login. */
  isAuthenticated: boolean
  login: (user: Pengguna) => void
  logout: () => void
}

const KEY = 'ruangku.auth'
const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Status login sengaja tidak dipersist: setiap app dibuka harus mulai dari
  // kondisi BELUM login, baru setelah Masuk/Daftar navbar dashboard muncul.
  const [user, setUser] = useState<Pengguna | null>(null)

  // Bersihkan sisa sesi lama di localStorage (dari versi sebelumnya).
  useEffect(() => {
    localStorage.removeItem(KEY)
  }, [])

  const login = useCallback((next: Pengguna) => {
    setUser(next)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const value = useMemo<AuthValue>(
    () => ({ user, isAuthenticated: user !== null, login, logout }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  return ctx
}

/** Akun demo bawaan (satu per peran) supaya alur bisa langsung dicoba. */
export const SANDI_DEMO = 'ruangku123'

export const DEMO_PENYEWA: Pengguna = {
  nama: 'Alana Pradita',
  email: 'alana@ruangku.test',
  peran: 'penyewa',
  status: 'aktif',
  terverifikasi: true,
}

export const DEMO_PENYEDIA: Pengguna = {
  nama: 'Bagas Nugroho',
  email: 'penyedia@ruangku.test',
  peran: 'penyedia',
  status: 'aktif',
  terverifikasi: true,
}

export const DEMO_ADMIN: Pengguna = {
  nama: 'Admin RuangKu',
  email: 'admin@ruangku.test',
  peran: 'admin',
  status: 'aktif',
  terverifikasi: true,
}

export interface AkunDemo extends Pengguna {
  sandi: string
}

/** Satu akun per peran — form login memilih akun dari email yang diketik. */
export const AKUN_DEMO: AkunDemo[] = [
  { ...DEMO_PENYEWA, sandi: SANDI_DEMO },
  { ...DEMO_PENYEDIA, sandi: SANDI_DEMO },
  { ...DEMO_ADMIN, sandi: SANDI_DEMO },
]

/** Kembalikan akun demo bila email & sandi cocok, selain itu null. */
export function cocokkanAkun(email: string, sandi: string): Pengguna | null {
  const akun = AKUN_DEMO.find((a) => a.email.toLowerCase() === email.trim().toLowerCase())
  if (!akun || akun.sandi !== sandi) return null
  return {
    nama: akun.nama,
    email: akun.email,
    peran: akun.peran,
    status: akun.status,
    terverifikasi: akun.terverifikasi,
  }
}
