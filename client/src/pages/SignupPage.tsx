import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateSignup, type SignupErrors } from '../utils/validation';
import FormField from '../components/FormField';
import Alert from '../components/Alert';
import type { UserRole } from '../types';

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<SignupForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });

  const [errors, setErrors] = useState<SignupErrors>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void {
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

    const validationErrors = validateSignup(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      navigate(user.role === 'organizer' ? '/organizer' : '/', {
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
        <h1 className="text-2xl font-bold">Create your account</h1>

        <p className="mb-6 mt-1 text-sm text-slate-500">
          Book events, or organise your own.
        </p>

        <Alert
          type="error"
          onClose={() => setServerError('')}
        >
          {serverError}
        </Alert>

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="Full name"
            name="name"
            autoComplete="name"
            placeholder="Anant Sharma"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
          />

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
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />

          <FormField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          <FormField
            label="I want to"
            name="role"
            as="select"
            value={form.role}
            onChange={handleChange}
            hint="Organizers can do everything a user can, plus create events."
          >
            <option value="user">Book events (User)</option>
            <option value="organizer">
              Create and manage events (Organizer)
            </option>
          </FormField>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-brand-600"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}