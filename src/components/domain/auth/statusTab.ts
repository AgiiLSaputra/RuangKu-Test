/** 4 state status akun (RENCANA §4D — fix D7). Sama untuk desktop & mobile. */
export type StatusKey = 'deactivated' | 'verification' | 'rejected' | 'email'

/** `?tab=` → StatusKey. `review` disamakan dengan `verification`. */
export function normalizeTab(tab: string | null | undefined): StatusKey {
  if (tab === 'verification' || tab === 'review') return 'verification'
  if (tab === 'rejected') return 'rejected'
  if (tab === 'email') return 'email'
  return 'deactivated'
}

/** Kode banding acak untuk kartu sukses (FR-H4). */
export function buatKodeBanding(): string {
  return `#APL-2026-${Math.floor(10000 + Math.random() * 90000)}`
}
