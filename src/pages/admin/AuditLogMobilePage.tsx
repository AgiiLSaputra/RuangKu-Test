import { useNavigate } from 'react-router-dom'
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

/** Kartu satu rekaman audit varian mobile. */
function KartuLogM({ l, onDetail }: { l: EntriLog; onDetail: () => void }) {
  return (
    <div className="flex flex-col gap-space-sm rounded-2xl border border-purple-100 bg-white p-space-md shadow-sm">
      {/* Waktu + ID log */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-label-md text-label-md font-semibold text-on-surface">{l.waktu}</span>
        <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 font-label-sm text-label-sm font-bold text-primary">
          #{l.id}
        </span>
      </div>

      {/* Aktor */}
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
          <span className="truncate font-title-md text-title-md font-semibold leading-tight text-on-surface">
            {l.aktor}
          </span>
          <ChipPeranAktor peran={l.peran} kecil />
        </span>
      </div>

      {/* Aksi + entitas */}
      <ChipAksi l={l} kecil />
      <div className="flex flex-col rounded-xl bg-purple-50 p-3 text-body-sm">
        <span className="text-slate-500">Entitas Terkait</span>
        {l.entitasJenis === 'IP_ADDRESS' ? (
          <>
            <span className="font-label-md text-label-md font-bold text-on-surface">
              {l.entitas}
            </span>
            <span className="font-label-sm text-label-sm text-slate-500">
              {l.refId.replace('-ID', '').replace('-', ' ')}
            </span>
          </>
        ) : (
          <>
            <span className="font-title-md text-title-md font-semibold text-on-surface">
              {l.entitas}
            </span>
            <span
              className={cn(
                'font-label-sm font-bold',
                l.entitasJenis === 'BOOKING' ? 'text-secondary' : 'text-purple-700',
              )}
            >
              #{l.refId}
            </span>
          </>
        )}
      </div>

      {/* Keterangan */}
      <div className="flex flex-col gap-1">
        <span className="font-body-sm leading-relaxed text-on-surface-variant">
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

      <button
        type="button"
        onClick={onDetail}
        className={cn(
          KELAS_TOMBOL,
          'h-9 w-full bg-purple-50 text-body-sm text-primary hover:bg-purple-100',
        )}
      >
        <Icon name="visibility" className="text-[16px]" />
        Lihat Payload JSON
      </button>
    </div>
  )
}

/**
 * Varian mobile halaman Audit Log — tabel diganti daftar kartu; filter
 * pencarian + rentang + jenis/peran + chip cepat tetap tersedia.
 */
export function AuditLogMobilePage() {
  const audit = useAuditLog()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-space-lg pb-6 pt-4">
      {/* 1. Kepala halaman */}
      <section className="flex flex-col gap-space-sm rounded-2xl bg-surface-container-lowest p-space-md shadow-card">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-body-sm text-slate-500">
          <button type="button" onClick={() => navigate('/admin')} className="hover:text-primary">
            Beranda
          </button>
          <Icon name="chevron_right" className="text-[14px] text-outline-variant" />
          <span className="font-medium text-primary">Audit Log</span>
        </nav>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile leading-none tracking-tight text-on-surface">
          Audit Log &amp; Integritas Sistem
        </h1>
        <p className="text-body-sm leading-relaxed text-slate-500">
          Rekaman jejak permanen aktivitas reservasi, verifikasi, penonaktifan akun, dan banding
          (SOP FR-I1, FR-G4, FR-G5).
        </p>
        <div className="flex items-center gap-2 self-start rounded-full bg-status-available-bg px-3 py-1.5 font-label-sm text-label-sm font-semibold text-status-available">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-available opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-status-available" />
          </span>
          Pencatatan SHA-256 Real-time Aktif
        </div>
        <button
          type="button"
          onClick={audit.eksporCsv}
          className={cn(
            KELAS_TOMBOL,
            'h-11 w-full bg-surface-container text-on-surface shadow-sm hover:bg-purple-100',
          )}
        >
          <Icon name="download" className="text-[18px]" />
          Ekspor Log (.CSV)
        </button>
      </section>

      {/* 2. Kartu statistik — 2 kolom */}
      <div className="grid grid-cols-2 gap-space-sm">
        <KartuStatLog
          ikon="database"
          label="Total Entri"
          nilai={audit.ringkas.total}
          satuan="Aktivitas"
          kaki="Terekam permanen"
          kakiIkon="verified"
          kakiIkonTeks="text-status-available"
          nada="utama"
          nilaiKelas="text-display-mobile"
        />
        <KartuStatLog
          ikon="shield_person"
          label="Aksi Admin"
          nilai={audit.ringkas.admin}
          satuan="Aksi"
          kaki="Verifikasi & banding"
          kakiIkon="schedule"
          kakiIkonTeks="text-purple-700"
          nada="admin"
          nilaiKelas="text-display-mobile"
        />
        <KartuStatLog
          ikon="sync_alt"
          label="Reservasi"
          nilai={audit.ringkas.reservasi}
          satuan="Mutasi"
          kaki="Status sewa & kuota"
          kakiIkon="tune"
          kakiIkonTeks="text-status-occupied"
          nada="reservasi"
          nilaiKelas="text-display-mobile"
        />
        <KartuStatLog
          ikon="warning"
          label="Anomali"
          nilai={audit.ringkas.anomali}
          satuan="Kejadian"
          kaki="Rate limit & suspensi"
          kakiIkon="lock_reset"
          kakiIkonTeks="text-status-full"
          nada="anomali"
          nilaiKelas="text-display-mobile"
        />
      </div>

      {/* 3. Panel filter */}
      <section className="flex flex-col gap-space-sm rounded-2xl bg-surface-container-lowest p-space-md shadow-card">
        <div className="relative flex items-center">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3.5 text-[20px] text-slate-500"
          />
          <input
            type="search"
            value={audit.cari}
            onChange={(e) => audit.setCari(e.target.value)}
            placeholder="Cari ID Log, aktor, atau entitas..."
            aria-label="Cari ID Log, nama aktor, atau entitas"
            className="h-11 w-full rounded-full bg-purple-50 pl-11 pr-4 text-body-sm text-on-surface shadow-inner placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <PopoverRentang audit={audit} />
        <div className="grid grid-cols-2 gap-space-sm">
          <SelectAudit
            value={audit.jenis}
            onChange={(v) => audit.setJenis(v as typeof audit.jenis)}
            label="Jenis aksi"
            opsi={[
              { id: 'semua', label: 'Semua Aksi' },
              ...Object.entries(JENIS_AKSI).map(([id, label]) => ({ id, label })),
            ]}
          />
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
        <div className="flex flex-wrap items-center gap-2">
          <ChipCepat
            ikon="schedule"
            label="24 Jam"
            aktif={audit.rentang === '0'}
            onClick={() => audit.setRentang(audit.rentang === '0' ? '7' : '0')}
          />
          <ChipCepat
            ikon="admin_panel_settings"
            label="Admin Saja"
            aktif={audit.peran === 'admin'}
            onClick={() => audit.setPeran(audit.peran === 'admin' ? 'semua' : 'admin')}
          />
          <ChipCepat
            ikon="error_outline"
            label="Kritis"
            aktif={audit.kritisOnly}
            onClick={audit.toggleKritis}
          />
          <ChipCepat
            ikon="verified_user"
            label="NIB & Izin"
            aktif={audit.nibOnly}
            onClick={audit.toggleNib}
          />
          <button
            type="button"
            onClick={audit.resetFilter}
            aria-label="Reset seluruh filter"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-slate-500 transition-all hover:bg-purple-100 hover:text-primary"
          >
            <Icon name="restart_alt" className="text-[18px]" />
          </button>
        </div>
      </section>

      {/* 4. Daftar rekaman */}
      {audit.halamanTampil.length === 0 ? (
        <div className="flex flex-col items-center gap-space-sm rounded-2xl bg-surface-container-lowest p-space-lg text-center shadow-card">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-primary">
            <Icon name="receipt_long" className="text-[24px]" />
          </span>
          <p className="font-title-md text-title-md font-semibold text-on-surface">
            Tidak ada rekaman yang cocok
          </p>
          <p className="max-w-xs text-body-sm text-slate-500">
            Ubah kata kunci, rentang waktu, jenis aksi, atau peran aktor.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-space-sm">
          {audit.halamanTampil.map((l) => (
            <KartuLogM key={l.id} l={l} onDetail={() => audit.setEntriDipilih(l)} />
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-space-sm rounded-2xl bg-purple-50/40 p-space-md">
        <span className="text-body-sm text-slate-500">
          Menampilkan{' '}
          <span className="font-semibold text-on-surface">
            {audit.ringkasHalaman.dari} -{' '}
            {Math.min(audit.ringkasHalaman.sampai, audit.ringkasHalaman.total)}
          </span>{' '}
          dari <span className="font-semibold text-on-surface">{audit.ringkasHalaman.total}</span>{' '}
          rekaman log
        </span>
        <Paginasi
          halaman={audit.ringkasHalaman.halaman}
          jumlahHalaman={audit.ringkasHalaman.jumlahHalaman}
          onPilih={audit.setHalaman}
        />
      </div>

      {/* 5. Catatan kepatuhan */}
      <section className="flex flex-col gap-space-sm rounded-2xl bg-purple-100/70 p-space-md">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm">
            <Icon name="policy" className="text-[22px]" />
          </span>
          <span className="font-title-md text-title-md font-bold leading-tight text-on-surface">
            Jaminan Kepatuhan Integritas &amp; Audit Trail
          </span>
        </div>
        <p className="font-body-sm text-body-sm leading-relaxed text-slate-500">
          Rekaman disimpan di partisi{' '}
          <span className="font-semibold text-primary">
            read-only terenkripsi WORM (Write Once, Read Many)
          </span>{' '}
          dengan penandatanganan SHA-256 — tidak dapat dimodifikasi atau dihapus, sesuai ISO/IEC
          27001 dan SOP RuangKu v1.0.
        </p>
        <span className="flex items-center gap-2">
          <Icon name="lock" className="text-[18px] text-status-available" />
          <span className="rounded-full bg-white px-3 py-1 font-label-sm text-label-sm font-semibold text-purple-700 shadow-sm">
            ISO/IEC 27001 COMPLIANT
          </span>
        </span>
      </section>

      {/* 6. Info mode demo */}
      <footer className="flex flex-col items-center gap-1 text-slate-500">
        <span className="flex items-center gap-2 font-label-sm text-label-sm">
          <span className="h-2 w-2 rounded-full bg-status-available" />
          RuangKu Super Admin v1.0 • Mode Demo (data mock lokal)
        </span>
        <span className="font-label-sm text-label-sm">
          FR-I1, FR-G4 &amp; FR-G5 Aktif • Zona Waktu WIB
        </span>
      </footer>

      <ModalPayloadLog audit={audit} />
    </div>
  )
}
