export function flagEmoji(code: string): string {
  const codePoints = code
    .toUpperCase()
    .split('')
    .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

export function scoreColor(score: number): string {
  if (score >= 5) return '#22c55e';
  if (score >= 4) return '#4ade80';
  if (score >= 3) return '#facc15';
  if (score >= 2) return '#f97316';
  return '#ef4444';
}

export function openfxBadgeColor(status: string): string {
  switch (status) {
    case 'active': return '#22c55e';
    case 'just_launched': return '#3b82f6';
    case 'coming_soon': return '#a78bfa';
    case 'not_covered': return '#6b7280';
    default: return '#6b7280';
  }
}

export function openfxLabel(status: string): string {
  switch (status) {
    case 'active': return 'Active';
    case 'just_launched': return 'Just Launched';
    case 'coming_soon': return 'Coming Soon';
    case 'not_covered': return 'Not Covered';
    default: return status;
  }
}
