import type { InputHTMLAttributes, ReactNode } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  as?: 'input' | 'textarea' | 'select';
  rows?: number;
  children?: ReactNode;
}

export default function FormField({
  label,
  name,
  error,
  hint,
  as = 'input',
  children,
  ...controlProps
}: FormFieldProps) {
  const Control = as as 'input';
  const fieldId = `field-${name}`;

  return (
    <div className="mb-4">
      <label className="label" htmlFor={fieldId}>
        {label}
      </label>

      <Control
        id={fieldId}
        name={name}
        className={`input ${error ? 'input-invalid' : ''} ${
          as === 'textarea' ? 'min-h-24 resize-y' : ''
        }`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...controlProps}
      >
        {children}
      </Control>

      {hint && !error && (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}

      {error && (
        <p
          className="mt-1.5 text-xs text-red-600"
          id={`${fieldId}-error`}
        >
          {error}
        </p>
      )}
    </div>
  );
}