export function formatPrice(priceCents: number): string {
  if (!priceCents) return 'Free';
  return `₹${(priceCents / 100).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;
}

export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}