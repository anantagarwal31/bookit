import type { ReactNode } from 'react';

export default function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-14 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>

      {message && (
        <p className="mt-1 text-slate-500">{message}</p>
      )}

      {action && (
        <div className="mt-4 flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
}