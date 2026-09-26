import type { ReactNode } from 'react';

type BadgeTone = 'neutral' | 'success' | 'danger' | 'warning';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-slate-200 text-slate-600',
  success: 'bg-green-100 text-green-700',
  danger: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
};

export default function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return <span className={`badge ${TONES[tone]}`}>{children}</span>;
}