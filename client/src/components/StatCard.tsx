type StatTone = 'default' | 'primary' | 'success';

const VALUE_TONES: Record<StatTone, string> = {
  default: 'text-slate-900',
  primary: 'text-brand-600',
  success: 'text-green-700',
};

export default function StatCard({
  label,
  value,
  helpText,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  helpText?: string;
  tone?: StatTone;
}) {
  return (
    <div className={`card p-6 ${tone === 'primary' ? 'border-brand-600' : ''}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`my-1 text-3xl font-bold ${VALUE_TONES[tone]}`}>{value}</p>
      {helpText && <p className="text-xs text-slate-500">{helpText}</p>}
    </div>
  );
}