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

export function toDateTimeLocalValue(isoString: string): string {
  const date = new Date(isoString);
  const pad = (n: number): string => String(n).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}