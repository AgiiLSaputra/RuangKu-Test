import { useState } from 'react'
import { cn } from '../../../lib/cn'
import { Icon } from '../../ui/Icon'
import { Overlay } from '../../ui/Overlay'
import {
  NADA_AKSI,
  PERAN_AKTOR,
  RENTANG,
  type EntriLog,
  type PeranAktor,
} from '../../../data/auditLog'
import { KELAS_TOMBOL, type AuditLog, type RentangWaktu } from './useAuditLog'

/** Nada kartu statistik audit — warna angka + latar ikon + aksen hover. */
const NADA_STAT: Record<'utama' | 'admin' | 'reservasi' | 'anomali', { teks: string; latar: string; hover: string }> = {
  utama: { teks: 'text-primary', latar: 'bg-purple-100', hover: 'group-hover:bg-primary group-hover:text-white' },
  admin: { teks: 'text-secondary', latar: 'bg-pink-100', hover: 'group-hover:bg-secondary group-hover:text-white' },
  reservasi: { teks: 'text-primary', latar: 'bg-purple-100', hover: 'group-hover:bg-primary group-hover:text-white' },
  anomali: { teks: 'text-status-full', latar: 'bg-status-full-bg', hover: 'group-hover:bg-status-full group-hover:text-white' },
}

/** Kartu statistik audit — dipakai desktop (4 kolom) & mobile (2 kolom). */
export function KartuStatLog({
  ikon,
  label,
  nilai,
  satuan,
  kaki,
  kakiIkon,
  kakiIkonTeks,
  nada,
  nilaiKelas = 'text-headline-md',
}: {
  ikon: string
  label: string
  nilai: string | number
  satuan: string
  kaki: string
  kakiIkon: string
  kakiIkonTeks: string
  nada: keyof typeof NADA_STAT
  nilaiKelas?: string
}) {
  const n = NADA_STAT[nada]
  return (
    <div className="group flex flex-col rounded-2xl bg-surface-container-lowest p-space-md shadow-card transition-all lg:p-space-lg">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-title-md text-title-md font-medium text-slate-500">{label}</span>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
            n.latar,
            n.teks,
            n.hover,
          )}
        >
          <Icon name={ikon} className="text-[20px]" />
        </span>
      </div>
      <div className="mb-1 flex items-baseline gap-2">
        <span className={cn('font-headline-md tracking-tight text-on-surface', nilaiKelas)}>
          {nilai}
        </span>
        <span className={cn('font-title-md text-title-md font-semibold', n.teks)}>{satuan}</span>
      </div>
      <div className="flex items-center gap-1.5 text-body-sm text-slate-500">
        <Icon name={kakiIkon} className={cn('text-[16px]', kakiIkonTeks)} />
        <span>{kaki}</span>
      </div>
    </div>
  )
}

/** Chip warna aksi pada tabel/kartu (ikut nada jenis aksi). */
export function ChipAksi({ l, kecil }: { l: EntriLog; kecil?: boolean }) {
  const n = NADA_AKSI[l.jenis]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-title-md font-semibold',
        kecil ? 'px-2.5 py-0.5 text-label-sm' : 'px-3 py-1 text-body-sm',
        l.ditolak ? 'bg-status-full-bg text-status-full' : n.chip,
      )}
    >
      <Icon name={l.ditolak ? 'cancel' : n.ikon} className="text-[18px]" />
      {l.aksi}
    </span>
  )
}

/** Chip peran aktor (Super Admin / Penyedia / Penyewa / Sistem / Keamanan). */
export function ChipPeranAktor({ peran, kecil }: { peran: PeranAktor; kecil?: boolean }) {
  const p = PERAN_AKTOR[peran]
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full font-label-sm font-bold',
        kecil ? 'px-2 py-0.5 text-label-sm' : 'px-2 py-0.5 text-label-sm',
        p.chip,
      )}
    >
      {p.label}
    </span>
  )
}

/** Tombol rentang waktu + popover pilihannya (tutup saat klik luar). */
export function PopoverRentang({ audit }: { audit: AuditLog }) {
  const [buka, setBuka] = useState(false)
  const opsi: Array<{ id: RentangWaktu; label: string }> = [
    { id: '0', label: RENTANG['0'] },
    { id: '3', label: RENTANG['3'] },
    { id: '7', label: RENTANG['7'] },
    { id: 'semua', label: RENTANG.semua },
  ]

  return (
    <div className="relative">
      {buka && (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          onClick={() => setBuka(false)}
          className="fixed inset-0 z-20 cursor-default"
        />
      )}
      <button
        type="button"
        onClick={() => setBuka((v) => !v)}
        aria-expanded={buka}
        className="flex h-11 w-full items-center justify-between rounded-full bg-purple-50 px-4 text-left transition-colors hover:bg-surface-container"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Icon name="calendar_today" className="shrink-0 text-[18px] text-primary" />
          <span className="truncate font-body-sm text-body-sm font-medium text-on-surface">
            {RENTANG[audit.rentang]}
          </span>
        </span>
        <Icon name="expand_more" className="shrink-0 text-[18px] text-slate-500" />
      </button>
      {buka && (
        <div className="absolute left-0 top-full z-30 mt-2 w-56 rounded-2xl bg-surface-container-lowest p-1.5 shadow-lg">
          <span className="block px-3 py-2 font-label-sm text-label-sm uppercase tracking-wider text-slate-500">
            Rentang Waktu
          </span>
          {opsi.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                audit.setRentang(o.id)
                setBuka(false)
              }}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left font-title-md text-body-md transition-colors',
                audit.rentang === o.id
                  ? 'bg-purple-100 font-semibold text-primary'
                  : 'text-on-surface hover:bg-purple-50',
              )}
            >
              {o.label}
              {audit.rentang === o.id && <Icon name="check" className="text-[18px]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Pilihan dropdown bawaan select (disamarkan via Icon). */
export function SelectAudit({
  value,
  onChange,
  opsi,
  label,
}: {
  value: string
  onChange: (v: string) => void
  opsi: Array<{ id: string; label: string }>
  label: string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-11 w-full cursor-pointer appearance-none rounded-full bg-purple-50 px-4 pr-10 font-body-sm text-body-sm font-medium text-on-surface outline-none transition-colors hover:bg-surface-container"
      >
        {opsi.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon
        name="arrow_drop_down"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[18px] text-slate-500"
      />
    </div>
  )
}

/** Chip filter cepat (toggle). */
export function ChipCepat({
  ikon,
  label,
  aktif,
  onClick,
}: {
  ikon: string
  label: string
  aktif: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktif}
      className={cn(
        'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-body-sm text-body-sm transition-all',
        aktif
          ? 'bg-purple-100 font-semibold text-primary'
          : 'bg-purple-50 font-medium text-slate-500 hover:bg-purple-100 hover:text-primary',
      )}
    >
      <Icon name={ikon} className="text-[15px]" />
      {label}
    </button>
  )
}

/** Modal detail payload JSON per entri (mockup modal-log-9842 + strip generic). */
export function ModalPayloadLog({ audit }: { audit: AuditLog }) {
  const l = audit.entriDipilih
  return (
    <Overlay
      open={Boolean(l)}
      onClose={() => audit.setEntriDipilih(null)}
      className="md:max-w-2xl"
      labelledBy="judul-modal-payload"
    >
      <div className="px-6 pb-8 pt-5 md:px-0 md:pb-0 md:pt-6">
        <div className="flex items-start justify-between gap-3 pr-10">
          <span className="flex min-w-0 items-center gap-2.5">
            <Icon name="code" className="shrink-0 text-[24px] text-primary" />
            <span
              id="judul-modal-payload"
              className="font-headline-sm text-headline-sm font-semibold text-on-surface"
            >
              Detail Payload Log #{l?.id}
            </span>
          </span>
        </div>

        <div className="mt-space-md rounded-xl bg-purple-50 p-4">
          <pre className="overflow-x-auto font-label-sm text-label-sm leading-relaxed text-on-surface">
            <code>{audit.payloadTerpilih}</code>
          </pre>
        </div>

        <p className="mt-3 font-label-sm text-label-sm font-semibold text-purple-700">
          STATUS: READ_ONLY_VERIFIED | SHA-256: VALID | NODE: JKT-AUDIT-01
        </p>

        <div className="mt-space-md flex flex-col-reverse items-stretch justify-between gap-space-sm sm:flex-row sm:items-center">
          <span className="text-body-sm text-slate-500">
            Terenkripsi &amp; diverifikasi konsistensinya oleh node audit internal
          </span>
          <button
            type="button"
            onClick={audit.salinJson}
            className={cn(
              KELAS_TOMBOL,
              'shrink-0 bg-primary px-5 py-2 text-white hover:bg-purple-700',
            )}
          >
            <Icon name={audit.tersalin ? 'check' : 'content_copy'} className="text-[18px]" />
            {audit.tersalin ? 'Tersalin!' : 'Salin JSON'}
          </button>
        </div>
      </div>
    </Overlay>
  )
}
