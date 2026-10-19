import { Link } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
import { cn } from '../../lib/cn'
import { JENIS_AKSI, PERAN_AKTOR, type EntriLog } from '../../data/auditLog'
import { Paginasi } from '../../components/domain/admin/ManajemenAkunBagian'
import {
  ChipAksi,
  ChipCepat,
  ChipPeranAktor,
  KartuStatLog,
  ModalPayloadLog,
  PopoverRentang,
  SelectAudit,
} from '../../components/domain/admin/AuditLogBagian'
import { KELAS_TOMBOL, useAuditLog } from '../../components/domain/admin/useAuditLog'

/** Warna teks referensi entitas mengikuti jenisnya. */
const TEKS_REF: Record<EntriLog['entitasJenis'], string> = {
  PROVIDER_ACCOUNT: 'text-purple-700',
  BOOKING: 'text-secondary',
  USER_ACCOUNT: 'text-purple-700',
  IP_ADDRESS: 'text-slate-500',
}

/** Tampilan nilai referensi — ID publik atau IP + lokasi. */
function NilaiRef({ l }: { l: EntriLog }) {
  if (l.entitasJenis === 'IP_ADDRESS') {
    return (
      <>
        <span className="font-label-md text-label-md font-bold text-on-surface">{l.entitas}</span>
        <span className="font-label-sm text-label-sm text-slate-500">
          {l.refId.replace('-ID', '').replace('-', ' ')}
        </span>
      </>
    )
  }
  return (
    <>
      <span className="font-title-md text-title-md font-semibold text-on-surface">{l.entitas}</span>
      <span className={cn('font-label-sm font-bold', TEKS_REF[l.entitasJenis])}>#{l.refId}</span>
    </>
  )
}

/** Satu baris tabel audit log. */
function BarisLog({ l, onDetail }: { l: EntriLog; onDetail: () => void }) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-purple-50/70',
        l.hariLalu % 2 === 1 ? 'bg-purple-50/40' : 'bg-surface-container-lowest',
      )}
    >
      <td className="px-6 py-4 align-top">
        <div className="flex flex-col gap-1">
          <span className="font-label-md text-label-md font-semibold text-on-surface">
            {l.waktu}
          </span>
          <span className="w-fit rounded-full bg-purple-100 px-2 py-0.5 font-label-sm text-label-sm font-bold text-primary">
            #{l.id}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 align-top">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-title-md text-title-md font-bold shadow-sm',
              PERAN_AKTOR[l.peran].avatar,
            )}
          >
            {l.inisial}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="font-title-md text-title-md font-semibold leading-tight text-on-surface">
              {l.aktor}
            </span>
            <span className="mt-1">
              <ChipPeranAktor peran={l.peran} kecil />
            </span>
          </span>
        </div>
      </td>
      <td className="px-6 py-4 align-top">
        <ChipAksi l={l} />
      </td>
      <td className="px-6 py-4 align-top">
        <div className="flex flex-col">
          <NilaiRef l={l} />
        </div>
      </td>
      <td className="px-6 py-4 align-top">
        <div className="flex max-w-sm flex-col gap-1">
          <span className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
            {l.keterangan}{' '}
            {l.sop.map((s, i) => (
              <span key={s} className="font-label-sm font-semibold text-primary">
                {i > 0 && ', '}
                ({s})
              </span>
            ))}
          </span>
          <span
            className={cn(
              'font-label-sm text-label-sm',
              l.metaNada === 'full' ? 'font-medium text-status-full' : 'text-slate-500',
            )}
          >
            {l.meta}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-center align-top">
        <button
          type="button"
          onClick={onDetail}
          className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 font-body-sm text-body-sm font-medium text-primary transition-all hover:bg-primary hover:text-white"
        >
          <Icon name="visibility" className="text-[16px]" />
          JSON
        </button>
      </td>
    </tr>
  )
}

/**
 * Halaman Audit Log super admin — mockup `Audit.html` (SOP FR-I1, FR-G4,
 * FR-G5). Tabel rekaman permanen + filter multi-kolom + modal payload JSON.
 */
export function AuditLogPage() {
  const audit = useAuditLog()
  return (
    <div className="mx-auto w-full max-w-[1440px] pb-6 pt-4">
      <div className="flex flex-col gap-space-lg">
        {/* 1. Kepala halaman: breadcrumb + judul + lencana + ekspor */}
        <div className="flex flex-col gap-space-md">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-body-sm text-slate-500">
            <Link to="/admin" className="transition-colors hover:text-primary">
              Beranda
            </Link>
            <Icon name="chevron_right" className="text-[14px] text-outline-variant" />
            <span>Super Admin</span>
            <Icon name="chevron_right" className="text-[14px] text-outline-variant" />
            <span className="font-medium text-primary">Audit Log &amp; Riwayat Sistem</span>
          </nav>
          <div className="flex flex-col justify-between gap-space-md lg:flex-row lg:items-center">
            <div className="flex max-w-3xl flex-col gap-1.5">
              <h1 className="font-headline-lg text-headline-lg leading-none tracking-tight text-on-surface">
                Audit Log &amp; Integritas Sistem
              </h1>
              <p className="text-body-md leading-relaxed text-slate-500">
                Rekaman jejak permanen seluruh aktivitas perubahan status reservasi, verifikasi
                berkas mitra, penonaktifan akun, dan keputusan banding sesuai regulasi SOP RuangKu (
                <span className="font-label-sm font-semibold text-purple-700">FR-I1</span>,{' '}
                <span className="font-label-sm font-semibold text-purple-700">FR-G4</span>,{' '}
                <span className="font-label-sm font-semibold text-purple-700">FR-G5</span>).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
              <div className="flex items-center gap-2.5 rounded-full bg-status-available-bg px-4 py-2 font-label-sm text-label-sm font-semibold text-status-available shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-available opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-status-available" />
                </span>
                Pencatatan Real-time Terenkripsi SHA-256 Aktif
              </div>
              <button
                type="button"
                onClick={audit.eksporCsv}
                className={cn(
                  KELAS_TOMBOL,
                  'bg-surface-container-lowest px-5 py-2.5 text-primary shadow-sm hover:bg-purple-100 hover:text-purple-700',
                )}
              >
                <Icon name="download" className="text-[18px]" />
                Ekspor Log (.CSV)
              </button>
            </div>
          </div>
        </div>

        {/* 2. Empat kartu statistik */}
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-4">
          <KartuStatLog
            ikon="database"
            label="Total Entri Log"
            nilai={audit.ringkas.total}
            satuan="Aktivitas"
            kaki="Semua sesi terekam permanen"
            kakiIkon="verified"
            kakiIkonTeks="text-status-available"
            nada="utama"
          />
          <KartuStatLog
            ikon="shield_person"
            label="Tindakan Super Admin"
            nilai={audit.ringkas.admin}
            satuan="Aksi"
            kaki="Bulan ini: verifikasi & banding"
            kakiIkon="schedule"
            kakiIkonTeks="text-purple-700"
            nada="admin"
          />
          <KartuStatLog
            ikon="sync_alt"
            label="Perubahan Reservasi"
            nilai={audit.ringkas.reservasi}
            satuan="Mutasi"
            kaki="Status sewa, jeda & kuota"
            kakiIkon="tune"
            kakiIkonTeks="text-status-occupied"
            nada="reservasi"
          />
          <KartuStatLog
            ikon="warning"
            label="Anomali / Penonaktifan"
            nilai={audit.ringkas.anomali}
            satuan="Kejadian"
            kaki="Termasuk rate limit & suspensi"
            kakiIkon="lock_reset"
            kakiIkonTeks="text-status-full"
            nada="anomali"
          />
        </div>

        {/* 3. Panel filter & pencarian */}
        <div className="flex flex-col gap-space-md rounded-2xl bg-surface-container-lowest p-space-lg shadow-card">
          <div className="grid grid-cols-1 items-center gap-space-md md:grid-cols-2 xl:grid-cols-12">
            <div className="relative flex items-center xl:col-span-4">
              <Icon
                name="search"
                className="pointer-events-none absolute left-4 text-[20px] text-slate-500"
              />
              <input
                type="search"
                value={audit.cari}
                onChange={(e) => audit.setCari(e.target.value)}
                placeholder="Cari ID Log, nama aktor, kode booking, atau entitas..."
                aria-label="Cari ID Log, nama aktor, kode booking, atau entitas"
                className="h-11 w-full rounded-full bg-purple-50 pl-11 pr-4 font-body-sm text-body-sm text-on-surface shadow-inner placeholder:text-slate-500 transition-all focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="xl:col-span-3">
              <PopoverRentang audit={audit} />
            </div>
            <div className="xl:col-span-2">
              <SelectAudit
                value={audit.jenis}
                onChange={(v) => audit.setJenis(v as typeof audit.jenis)}
                label="Jenis aksi"
                opsi={[
                  { id: 'semua', label: 'Semua Jenis Aksi' },
                  ...Object.entries(JENIS_AKSI).map(([id, label]) => ({ id, label })),
                ]}
              />
            </div>
            <div className="xl:col-span-2">
              <SelectAudit
                value={audit.peran}
                onChange={(v) => audit.setPeran(v as typeof audit.peran)}
                label="Peran aktor"
                opsi={[
                  { id: 'semua', label: 'Semua Peran' },
                  ...Object.entries(PERAN_AKTOR).map(([id, p]) => ({ id, label: p.label })),
                ]}
              />
            </div>
            <div className="flex justify-end xl:col-span-1">
              <button
                type="button"
                onClick={audit.resetFilter}
                title="Reset Filter"
                aria-label="Reset seluruh filter"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-50 text-slate-500 transition-all hover:bg-purple-100 hover:text-primary"
              >
                <Icon name="restart_alt" className="text-[20px]" />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="mr-1 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-slate-500">
              Filter Cepat:
            </span>
            <ChipCepat
              ikon="schedule"
              label="24 Jam Terakhir"
              aktif={audit.rentang === '0'}
              onClick={() => audit.setRentang(audit.rentang === '0' ? '7' : '0')}
            />
            <ChipCepat
              ikon="admin_panel_settings"
              label="Tindakan Admin Saja"
              aktif={audit.peran === 'admin'}
              onClick={() => audit.setPeran(audit.peran === 'admin' ? 'semua' : 'admin')}
            />
            <ChipCepat
              ikon="error_outline"
              label="Perubahan Kritis"
              aktif={audit.kritisOnly}
              onClick={audit.toggleKritis}
            />
            <ChipCepat
              ikon="verified_user"
              label="Mitra NIB & Izin"
              aktif={audit.nibOnly}
              onClick={audit.toggleNib}
            />
          </div>
        </div>

        {/* 4. Tabel rekaman audit */}
        <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead>
                <tr className="bg-purple-100 text-on-surface">
                  <th className="px-6 py-4 font-title-md text-title-md font-bold tracking-tight">
                    Waktu &amp; ID Log
                  </th>
                  <th className="px-6 py-4 font-title-md text-title-md font-bold tracking-tight">
                    Aktor
                  </th>
                  <th className="px-6 py-4 font-title-md text-title-md font-bold tracking-tight">
                    Aksi
                  </th>
                  <th className="px-6 py-4 font-title-md text-title-md font-bold tracking-tight">
                    Entitas Terkait
                  </th>
                  <th className="px-6 py-4 font-title-md text-title-md font-bold tracking-tight">
                    Keterangan / Rincian SOP
                  </th>
                  <th className="px-6 py-4 text-center font-title-md text-title-md font-bold tracking-tight">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-body-md">
                {audit.halamanTampil.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <p className="font-title-md text-title-md font-semibold text-on-surface">
                        Tidak ada rekaman yang cocok
                      </p>
                      <p className="mt-1 text-body-sm text-slate-500">
                        Ubah kata kunci, rentang waktu, jenis aksi, atau peran aktor.
                      </p>
                    </td>
                  </tr>
                ) : (
                  audit.halamanTampil.map((l) => (
                    <BarisLog key={l.id} l={l} onDetail={() => audit.setEntriDipilih(l)} />
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col items-center justify-between gap-space-md bg-surface-container-lowest p-5 sm:flex-row">
            <span className="text-body-sm text-slate-500">
              Menampilkan{' '}
              <span className="font-semibold text-on-surface">
                {audit.ringkasHalaman.dari} -{' '}
                {Math.min(audit.ringkasHalaman.sampai, audit.ringkasHalaman.total)}
              </span>{' '}
              dari{' '}
              <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                {audit.ringkasHalaman.total}
              </span>{' '}
              rekaman log
            </span>
            <Paginasi
              halaman={audit.ringkasHalaman.halaman}
              jumlahHalaman={audit.ringkasHalaman.jumlahHalaman}
              onPilih={audit.setHalaman}
            />
          </div>
        </div>

        {/* 5. Catatan kepatuhan */}
        <div className="flex flex-col items-start justify-between gap-space-md rounded-2xl bg-purple-100/70 p-space-lg md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-sm">
              <Icon name="policy" className="text-[22px]" />
            </span>
            <span className="flex flex-col">
              <span className="font-title-md text-title-md font-bold leading-tight text-on-surface">
                Jaminan Kepatuhan Integritas &amp; Audit Trail
              </span>
              <span className="font-body-sm text-body-sm leading-relaxed text-slate-500">
                Seluruh rekaman audit log disimpan dalam partisi{' '}
                <span className="font-semibold text-primary">
                  read-only terenkripsi WORM (Write Once, Read Many)
                </span>{' '}
                dan dilindungi penandatanganan kriptografis SHA-256 agar tidak dapat dimodifikasi
                ataupun dihapus oleh aktor manapun, sesuai standar regulasi ISO/IEC 27001 dan SOP
                RuangKu v1.0.
              </span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Icon name="lock" className="text-[20px] text-status-available" />
            <span className="rounded-full bg-surface-container-lowest px-3 py-1.5 font-label-sm text-label-sm font-semibold text-purple-700 shadow-sm">
              ISO/IEC 27001 COMPLIANT
            </span>
          </div>
        </div>

        {/* 6. Info mode demo */}
        <footer className="flex flex-col items-center justify-between gap-2 pt-2 text-slate-500 sm:flex-row">
          <span className="flex items-center gap-2 font-label-sm text-label-sm">
            <span className="h-2 w-2 rounded-full bg-status-available" />
            RuangKu Super Admin v1.0 • Mode Demo (data mock lokal)
          </span>
          <span className="flex items-center gap-3 font-label-sm text-label-sm">
            <span>Zona Waktu Server: WIB (UTC+7)</span>
            <span>•</span>
            <span className="font-medium text-primary">FR-I1, FR-G4 &amp; FR-G5 Aktif</span>
          </span>
        </footer>
      </div>

      <ModalPayloadLog audit={audit} />
    </div>
  )
}
