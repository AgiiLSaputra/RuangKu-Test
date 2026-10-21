import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { Icon } from '../../components/ui/Icon'
import { useAuth } from '../../context/AuthContext'
import { IMG } from '../../data/images'
import { rp } from '../../lib/format'

type Status = 'Pending' | 'Approved' | 'Completed' | 'Dibatalkan'

interface BarisRiwayat {
  kode: string
  nama: string
  tanggal: string
  durasi: string
  biaya: number
  status: Status
}

const RIWAYAT: BarisRiwayat[] = [
  {
    kode: 'RK-2026-9042',
    nama: 'Aura Executive Boardroom & Workshop',
    tanggal: '12 Des 2026',
    durasi: '4 Jam',
    biaya: 1_400_000,
    status: 'Pending',
  },
  {
    kode: 'RK-2026-8819',
    nama: 'Grand Ballroom Sudirman — Hall A',
    tanggal: '18 Nov 2026',
    durasi: '8 Jam',
    biaya: 8_500_000,
    status: 'Approved',
  },
  {
    kode: 'RK-2026-8701',
    nama: 'Inovasi Meeting Boardroom',
    tanggal: '25 Okt 2026',
    durasi: '4 Jam',
    biaya: 720_000,
    status: 'Approved',
  },
  {
    kode: 'RK-2026-7910',
    nama: 'Skyview Rooftop Lounge & Stage',
    tanggal: '10 Okt 2026',
    durasi: '6 Jam',
    biaya: 5_250_000,
    status: 'Completed',
  },
  {
    kode: 'RK-2026-7240',
    nama: 'Nusantara Convention Hall',
    tanggal: '04 Okt 2026',
    durasi: '10 Jam',
    biaya: 6_000_000,
    status: 'Completed',
  },
  {
    kode: 'RK-2026-6114',
    nama: 'Creative Hall Dago — Stage Room',
    tanggal: '15 Sep 2026',
    durasi: '6 Jam',
    biaya: 2_100_000,
    status: 'Completed',
  },
  {
    kode: 'RK-2026-5082',
    nama: 'Synergy Coworking & Event Space',
    tanggal: '22 Agu 2026',
    durasi: '5 Jam',
    biaya: 750_000,
    status: 'Dibatalkan',
  },
]

const GAYA_STATUS: Record<Status, string> = {
  Pending: 'bg-status-occupied-bg text-status-occupied',
  Approved: 'bg-status-available-bg text-status-available',
  Completed: 'bg-purple-100 text-primary',
  Dibatalkan: 'bg-status-full-bg text-status-full',
}

const FILTER: { label: string; nilai: Status | 'Semua'; jumlah: number }[] = [
  { label: 'Semua', nilai: 'Semua', jumlah: 18 },
  { label: 'Pending', nilai: 'Pending', jumlah: 1 },
  { label: 'Approved', nilai: 'Approved', jumlah: 2 },
  { label: 'Completed', nilai: 'Completed', jumlah: 14 },
  { label: 'Dibatalkan', nilai: 'Dibatalkan', jumlah: 1 },
]

const STATISTIK = [
  {
    angka: '3',
    label: 'Reservasi Aktif',
    kaki: '2 Appr • 1 Pend',
    panel: 'bg-purple-100 text-primary',
    angkaCls: 'text-on-surface',
    kakiCls: 'text-slate-500',
    ikon: 'calendar_today',
  },
  {
    angka: '1',
    label: 'Menunggu',
    kaki: 'Konfirmasi',
    panel: 'bg-status-occupied-bg text-status-occupied',
    angkaCls: 'text-status-occupied',
    kakiCls: 'text-slate-500',
    ikon: 'hourglass_top',
  },
  {
    angka: '14',
    label: 'Selesai',
    kaki: '100% Aman',
    panel: 'bg-status-available-bg text-status-available',
    angkaCls: 'text-on-surface',
    kakiCls: 'text-status-available font-semibold',
    ikon: 'task_alt',
  },
]

const MENDATANG = [
  {
    kode: 'RK-2026-8819',
    nama: 'Grand Ballroom Sudirman — Hall A',
    gambar: IMG.ballroom,
    alt: 'Grand Ballroom Sudirman',
    gedung: 'Sudirman Central Building • PT Multi Graha Sarana',
    waktu: 'Rabu, 18 Nov 2026 • 09:00 - 17:00 WIB',
    paket: 'Paket Full-Day (8 Jam)',
    biaya: 8_500_000,
    catatan: 'Sisa waktu H-25 • Pembatalan mandiri bebas penalti',
    peringatan: false,
    aksiTengah: 'Reschedule',
  },
  {
    kode: 'RK-2026-8701',
    nama: 'Inovasi Meeting Boardroom (VIP)',
    gambar: IMG.boardroom,
    alt: 'Inovasi Meeting Boardroom VIP',
    gedung: 'Pratama Creative Hub • Hendra Wijaya',
    waktu: 'Besok, 25 Okt 2026 • 13:00 - 17:00 WIB',
    paket: 'Sewa 4 Jam',
    biaya: 720_000,
    catatan: 'H-1: Pembatalan/Reschedule memerlukan verifikasi pengelola',
    peringatan: true,
    aksiTengah: 'Ajukan Jadwal',
  },
]

const AWAL_TAMPIL = 3

/** Dashboard penyewa — varian MOBILE (DashboardPenyewaMobile.html). FR-C12, FR-D1, FR-C20. */
export function DashboardPenyewaMobilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [filter, setFilter] = useState<Status | 'Semua'>('Semua')
  const [muatSemua, setMuatSemua] = useState(false)
  const [bannerAktif, setBannerAktif] = useState(true)
  const [modalSetuju, setModalSetuju] = useState(false)

  const terfilter = filter === 'Semua' ? RIWAYAT : RIWAYAT.filter((r) => r.status === filter)
  const baris = muatSemua ? terfilter : terfilter.slice(0, AWAL_TAMPIL)

  function setujui() {
    setModalSetuju(true)
  }

  function tolak() {
    if (window.confirm('Apakah Anda yakin ingin menolak usulan perubahan jadwal ini?')) setBannerAktif(false)
  }

  return (
    <div className="relative flex min-h-screen flex-col gap-space-lg bg-surface px-gutter pb-space-lg pt-space-md">
      {/* ============ 1. SAPAAN + CTA CEPAT ============ */}
      <section className="relative flex flex-col gap-space-md overflow-hidden rounded-lg bg-surface-container-lowest p-space-lg shadow-sm">
        <span className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-purple-100 blur-2xl" />

        <div className="relative z-10 flex items-start justify-between gap-space-sm">
          <div className="flex flex-col">
            <span className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm font-extrabold tracking-tight text-on-surface">
                Halo, {user?.nama ?? 'Penyewa'}
              </span>
              <Icon name="waving_hand" filled className="text-[22px] text-secondary" />
            </span>
            <span className="mt-1 font-body-sm text-body-sm text-slate-500">
              Kamis, 24 Oktober 2026 • Kelola aktivitas pemesanan gedung &amp; jadwal acara Anda.
            </span>
          </div>
          <span className="shrink-0 rounded-full bg-purple-100 px-2.5 py-1 font-label-sm text-label-sm font-semibold text-primary">
            PENYEWA
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/cari-ruangan')}
          className="relative z-10 flex h-12 w-full items-center justify-center gap-space-sm rounded-full bg-gradient-to-r from-primary via-primary-container to-secondary font-title-md text-title-md text-on-primary shadow-md transition-all hover:opacity-95 active:scale-[0.99]"
        >
          <Icon name="search" className="text-[20px]" />
          <span>Cari Ruangan Baru</span>
        </button>
      </section>

      {/* ============ 2. RINGKASAN STATISTIK ============ */}
      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between px-1">
          <span className="font-title-md text-title-md font-bold text-on-surface">Ringkasan Aktivitas</span>
          <span className="font-label-sm text-label-sm text-slate-500">Bulan Ini</span>
        </div>
        <div className="grid grid-cols-3 gap-space-xs">
          {STATISTIK.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center rounded-lg bg-surface-container-lowest p-space-sm text-center shadow-sm"
            >
              <span className={cn('mb-1 flex h-8 w-8 items-center justify-center rounded-full', s.panel)}>
                <Icon name={s.ikon} className="text-[18px]" />
              </span>
              <span className={cn('font-label-md text-[20px] font-bold leading-tight', s.angkaCls)}>{s.angka}</span>
              <span className="mt-0.5 font-label-sm text-label-sm font-medium text-on-surface-variant">{s.label}</span>
              <span className={cn('mt-0.5 font-label-sm text-[10px]', s.kakiCls)}>{s.kaki}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ 3. BANNER PERMINTAAN RESCHEDULE (FR-D1) ============ */}
      {bannerAktif && (
        <section className="flex flex-col gap-space-sm rounded-lg bg-status-occupied-bg p-space-md shadow-sm transition-all duration-300">
          <div className="flex items-center gap-space-xs">
            <Icon name="pending_actions" className="shrink-0 text-[20px] text-status-occupied" />
            <span className="rounded-full bg-surface-container-lowest px-2 py-0.5 font-label-sm text-[10px] font-bold tracking-tight text-tertiary-container">
              PERMINTAAN PERUBAHAN JADWAL • RK-2026-8819
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-title-md text-[15px] font-bold leading-snug text-on-surface">
              PT Graha Multi Kreasi mengajukan penyesuaian jadwal untuk Horizon Grand Ballroom &amp; Event Hall
            </span>
            <div className="mt-1 flex flex-col gap-0.5 rounded-md bg-surface-container-lowest p-space-sm">
              <span className="font-label-sm text-label-sm font-semibold text-slate-500">Usulan Jadwal Baru:</span>
              <span className="font-title-md text-title-md font-bold text-primary">
                Sabtu, 08 Nov 2026 • 09:00 - 13:00 WIB
              </span>
              <span className="font-body-sm text-body-sm text-slate-500">Durasi tetap 4 Jam</span>
            </div>
            <p className="mt-1 font-body-sm italic text-on-surface-variant">
              “Mohon maaf, pada tanggal 7 Nov ada gladi resik kenegaraan mendadak dari Sekretariat Negara.”
            </p>
          </div>

          <div className="flex items-center gap-space-sm pt-1">
            <button
              type="button"
              onClick={setujui}
              className="flex h-10 flex-1 items-center justify-center gap-1 rounded-full bg-primary font-title-md text-[14px] text-on-primary shadow-sm transition-all hover:bg-purple-700 active:scale-95"
            >
              <Icon name="done" className="text-[16px]" />
              <span>Setujui</span>
            </button>
            <button
              type="button"
              onClick={tolak}
              className="flex h-10 flex-1 items-center justify-center gap-1 rounded-full bg-error-container font-title-md text-[14px] text-error transition-all hover:opacity-90 active:scale-95"
            >
              <Icon name="close" className="text-[16px]" />
              <span>Tolak &amp; Batalkan</span>
            </button>
          </div>
        </section>
      )}

      {/* ============ 4. RESERVASI MENDATANG ============ */}
      <section className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Reservasi Mendatang</span>
            <span className="rounded-full bg-purple-100 px-2 py-0.5 font-label-sm text-label-sm font-semibold text-primary">
              2
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/pesanan')}
            className="flex items-center gap-0.5 font-title-md text-[13px] font-bold text-primary hover:underline"
          >
            <span>Semua</span>
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
        </div>

        {MENDATANG.map((m) => (
          <article
            key={m.kode}
            className="flex flex-col gap-space-sm rounded-lg bg-surface-container-lowest p-space-md shadow-sm"
          >
            <div className="relative h-36 w-full overflow-hidden rounded-md bg-surface-container">
              <img src={m.gambar} alt={m.alt} className="h-full w-full object-cover" />
              <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-status-available-bg px-2.5 py-1 font-label-sm text-label-sm font-semibold text-status-available shadow-sm">
                <Icon name="check_circle" className="text-[14px]" />
                Approved
              </span>
              <span className="absolute bottom-2.5 right-2.5 rounded-full bg-on-background/70 px-2.5 py-0.5 font-label-sm text-label-sm font-medium text-surface backdrop-blur-md">
                {m.kode}
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="font-headline-sm text-[18px] font-bold leading-tight text-on-surface">{m.nama}</span>
              <span className="font-body-sm text-body-sm text-slate-500">{m.gedung}</span>
            </div>

            <div className="flex flex-col gap-1 rounded-md bg-purple-50 p-space-sm">
              <span className="flex items-center gap-2 text-on-surface-variant">
                <Icon name="event" className="text-[18px] text-primary" />
                <span className="font-body-sm font-medium">{m.waktu}</span>
              </span>
              <span className="flex items-center justify-between pt-1 text-on-surface-variant">
                <span className="font-body-sm text-body-sm text-slate-500">{m.paket}</span>
                <span className="font-label-md text-label-md font-bold text-primary">{rp(m.biaya)}</span>
              </span>
            </div>

            {m.peringatan ? (
              <div className="flex items-center gap-1.5 rounded-md bg-status-occupied-bg px-2 py-1 text-tertiary-container">
                <Icon name="warning" className="shrink-0 text-[16px] text-status-occupied" />
                <span className="font-body-sm text-[11px] font-medium leading-tight">{m.catatan}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-1 text-slate-500">
                <Icon name="info" className="text-[16px] text-status-available" />
                <span className="font-body-sm text-[12px]">{m.catatan}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => navigate(`/struk?kode=${m.kode}`)}
                className="flex h-10 flex-1 items-center justify-center gap-1 rounded-full bg-purple-100 font-title-md text-[13px] font-semibold text-primary transition-all hover:bg-purple-300/40 active:scale-95"
              >
                <Icon name="receipt" className="text-[16px]" />
                <span>Struk PDF</span>
              </button>
              <button
                type="button"
                className="flex h-10 flex-1 items-center justify-center gap-1 rounded-full bg-surface-container-high font-title-md text-[13px] font-semibold text-on-surface transition-all hover:bg-surface-container-highest active:scale-95"
              >
                <Icon name="edit_calendar" className="text-[16px]" />
                <span>{m.aksiTengah}</span>
              </button>
              <button
                type="button"
                aria-label={m.peringatan ? 'Ajukan Batal' : 'Batalkan'}
                className="flex h-10 items-center justify-center rounded-full bg-surface-container px-3.5 font-title-md text-[13px] font-semibold text-error transition-all hover:bg-error-container active:scale-95"
              >
                <Icon name="cancel" className="text-[18px]" />
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* ============ 5. RIWAYAT & STATUS ============ */}
      <section className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between px-1">
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Riwayat &amp; Status</span>
          <span className="font-body-sm text-body-sm text-slate-500">Total 18 Entri</span>
        </div>

        <div className="-mx-gutter flex items-center gap-2 overflow-x-auto px-gutter pb-1">
          {FILTER.map((f) => {
            const aktif = filter === f.nilai
            return (
              <button
                key={f.nilai}
                type="button"
                onClick={() => setFilter(f.nilai)}
                className={cn(
                  'h-9 shrink-0 rounded-full px-4 font-title-md text-[13px] transition-all active:scale-95',
                  aktif
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:bg-purple-100',
                )}
              >
                {f.label} ({f.jumlah})
              </button>
            )
          })}
        </div>

        {baris.map((r) => (
          <div
            key={r.kode}
            className="flex flex-col gap-space-xs rounded-lg bg-surface-container-lowest p-space-md shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm font-semibold text-slate-500">{r.kode}</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 font-label-sm text-[11px] font-bold',
                  GAYA_STATUS[r.status],
                )}
              >
                {r.status}
              </span>
            </div>
            <span className="font-title-md text-title-md font-bold text-on-surface">{r.nama}</span>
            <div className="flex items-center justify-between font-body-sm text-body-sm text-slate-500">
              <span>
                {r.tanggal} • {r.durasi}
              </span>
              <span className="font-label-md text-label-md font-bold text-on-surface">{rp(r.biaya)}</span>
            </div>
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => navigate(`/struk?kode=${r.kode}`)}
                className="inline-flex items-center gap-1 font-title-md text-[13px] font-bold text-primary hover:underline"
              >
                <span>Lihat Struk PDF</span>
                <Icon name="arrow_forward" className="text-[16px]" />
              </button>
            </div>
          </div>
        ))}

        {muatSemua ? (
          <div className="flex h-11 w-full items-center justify-center gap-1 rounded-full bg-surface-container-lowest font-title-md text-[14px] text-on-surface-variant opacity-60 shadow-sm">
            <span>Semua Riwayat Ditampilkan</span>
            <Icon name="done_all" className="text-[18px]" />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setMuatSemua(true)}
            className="flex h-11 w-full items-center justify-center gap-1 rounded-full bg-surface-container-lowest font-title-md text-[14px] text-on-surface-variant shadow-sm transition-all hover:bg-purple-100 active:scale-[0.99]"
          >
            <span>Muat Lebih Banyak Riwayat</span>
            <Icon name="expand_more" className="text-[18px]" />
          </button>
        )}
      </section>

      {/* ============ MODAL PERSETUJUAN ============ */}
      {modalSetuju && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-gutter backdrop-blur-sm">
          <div className="flex w-full max-w-sm flex-col gap-space-md rounded-lg bg-surface-container-lowest p-space-lg shadow-xl">
            <div className="flex items-center gap-space-sm text-status-available">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-status-available-bg">
                <Icon name="verified" className="text-[24px]" />
              </span>
              <span className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface">Persetujuan Terkirim</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Jadwal baru tersinkronisasi otomatis.
                </span>
              </span>
            </div>
            <p className="font-body-md text-on-surface-variant">
              Perubahan jadwal ke <strong className="text-on-surface">Sabtu, 08 Nov 2026 (09:00 - 13:00 WIB)</strong>{' '}
              telah disetujui. Struk digital pembaruan telah diperbarui ke daftar riwayat Anda.
            </p>
            <button
              type="button"
              onClick={() => {
                setModalSetuju(false)
                setBannerAktif(false)
              }}
              className="flex h-11 w-full items-center justify-center rounded-full bg-primary font-title-md text-title-md text-on-primary transition-all hover:bg-purple-700 active:scale-[0.98]"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
