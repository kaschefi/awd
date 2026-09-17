/**
 * Formatting and badge utility functions with strict TypeScript types (no any).
 */

export function formatDate(ts?: string | number | null): string {
  if (!ts) return 'Unknown date';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return String(ts);
  return (
    d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  );
}

export type EvidenceStatus = 'reviewed' | 'flagged' | 'unreviewed' | string;

export function getStatusBadgeClass(status?: EvidenceStatus | null): string {
  const s = (status || '').toLowerCase();
  if (s === 'reviewed') return 'badge-reviewed';
  if (s === 'flagged') return 'badge-flagged';
  return 'badge-unreviewed';
}

export type EvidenceRelevance = 'relevant' | 'irrelevant' | 'unknown' | string;

export function getRelevanceBadgeClass(relevance?: EvidenceRelevance | null): string {
  const r = (relevance || '').toLowerCase();
  if (r === 'relevant') return 'badge-relevant';
  return 'badge-unreviewed';
}

export type TimelineCertainty = 'confirmed' | 'contradictory' | 'reported' | string;

export function certaintyBadgeClass(certainty?: TimelineCertainty | null): string {
  if (certainty === 'confirmed') return 'reviewed';
  if (certainty === 'contradictory') return 'critical';
  if (certainty === 'reported') return 'flagged';
  return 'unreviewed';
}
