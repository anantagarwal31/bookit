import type { ReactNode } from 'react';

type AlertType = 'error' | 'success' | 'info' | 'warning';

interface AlertProps {
  type?: AlertType;
  children?: ReactNode;
  onClose?: () => void;
}

const TONES: Record<AlertType, string> = {
  error: 'bg-red-50 border-red-200 text-red-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-brand-50 border-brand-200 text-brand-800',
};

export default function Alert({
  type = 'info',
  children,
  onClose,
}: AlertProps) {
  if (!children) return null;

  return (
    <div
      className={`mb-4 flex items-start justify-between gap-4 rounded-lg border px-4 py-3 text-sm ${TONES[type]}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      <span>{children}</span>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="text-lg leading-none"
        >
          ×
        </button>
      )}
    </div>
  );
}