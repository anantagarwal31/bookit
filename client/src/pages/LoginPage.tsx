import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  validateLogin,
  type LoginErrors,
  type LoginFormValues,
} from '../utils/validation';
import FormField from '../components/FormField';
import Alert from '../components/Alert';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState<LoginFormValues>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }));
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setServerError('');

    const validationErrors = validateLogin(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(form);

      const from = (location.state as { from?: string } | null)?.from;

      navigate(from ?? '/', {
        replace: true,
      });
    } catch (error) {
      setServerError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8 shadow-md">
        <h1 className="text-2xl font-bold">Welcome back</h1>

        <p className="mb-6 mt-1 text-sm text-slate-500">
          Log in to book seats and manage your events.
        </p>

        <Alert
          type="error"
          onClose={() => setServerError('')}
        >
          {serverError}
        </Alert>

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to BookIt?{' '}
          <Link
            to="/signup"
            className="font-semibold text-brand-600"
          >
            Create an account
          </Link>
        </p>

        <div className="mt-6 flex flex-col gap-0.5 rounded-lg bg-slate-50 p-4 text-xs text-slate-500">
          <strong className="text-slate-900">Demo accounts</strong>
          <span>organizer@bookit.com — organizer</span>
          <span>user@bookit.com — user</span>
          <span>password: Password123</span>
        </div>
      </div>
    </div>
  );
}