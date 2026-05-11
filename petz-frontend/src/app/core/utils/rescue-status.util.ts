/**
 * Single source of truth for rescue status display labels.
 *
 * Backend enum values (never change these — they're stored in the DB):
 *   PENDING | ASSIGNED | IN_PROGRESS | COMPLETED | RESOLVED | CANCELLED
 *
 * What users see:
 *   ASSIGNED    → "Reported"               (rescue reported to NGO, not yet confirmed)
 *   IN_PROGRESS → "Assigned & In Progress" (NGO accepted and is actively working)
 */
export function rescueStatusLabel(status: string): string {
  switch ((status || '').toUpperCase()) {
    case 'PENDING':     return 'Pending';
    case 'ASSIGNED':    return 'Reported';
    case 'IN_PROGRESS': return 'Assigned & In Progress';
    case 'COMPLETED':
    case 'RESOLVED':    return 'Completed';
    case 'CANCELLED':   return 'Cancelled';
    default:            return status ?? '—';
  }
}
