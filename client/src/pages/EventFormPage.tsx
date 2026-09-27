import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { organizerApi } from '../api/endpoints';
import { validateEventForm, type EventErrors, type EventFormValues } from '../utils/validation';
import { toDateTimeLocalValue } from '../utils/format';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const EMPTY_FORM: EventFormValues = {
  title: '',
  description: '',
  venue: '',
  startsAt: '',
  capacity: '',
  price: '',
};

/**
 * One form used for BOTH creating and editing an event.
 * If the route has an :id we load that event and switch to edit mode.
 */
export default function EventFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<EventFormValues>(EMPTY_FORM);
  const [seatsBooked, setSeatsBooked] = useState(0);
  const [errors, setErrors] = useState<EventErrors>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    organizerApi
      .getEvent(id)
      .then(({ event }) => {
        setForm({
          title: event.title,
          description: event.description,
          venue: event.venue,
          startsAt: toDateTimeLocalValue(event.starts_at),
          capacity: String(event.capacity),
          price: String(event.price_cents / 100),
        });
        setSeatsBooked(event.seats_booked);
      })
      .catch((error: Error) => setServerError(error.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setServerError('');

    const validationErrors = validateEventForm(form);

    // Extra rule that only applies when editing: capacity may not drop below
    // the seats already sold. The API enforces this too.
    if (isEditMode && Number(form.capacity) < seatsBooked) {
      validationErrors.capacity = `Capacity cannot be less than the ${seatsBooked} seat(s) already booked`;
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      venue: form.venue.trim(),
      startsAt: new Date(form.startsAt).toISOString(),
      capacity: Number(form.capacity),
      priceCents: Math.round(Number(form.price) * 100), // money is stored in paise
    };

    setIsSubmitting(true);
    try {
      if (id) await organizerApi.update(id, payload);
      else await organizerApi.create(payload);
      navigate('/organizer', { replace: true });
    } catch (error) {
      setServerError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <Spinner label="Loading event…" />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <PageHeader
        title={isEditMode ? 'Edit event' : 'Create a new event'}
        subtitle={
          isEditMode
            ? `${seatsBooked} seat(s) already booked — capacity cannot go below this.`
            : 'Fill in the details below. All fields are required.'
        }
      />

      <Alert type="error" onClose={() => setServerError('')}>
        {serverError}
      </Alert>

      <form className="card p-6" onSubmit={handleSubmit} noValidate>
        <FormField
          label="Event title"
          name="title"
          placeholder="React India Meetup"
          value={form.title}
          onChange={handleChange}
          error={errors.title}
        />

        <FormField
          label="Description"
          name="description"
          as="textarea"
          rows={5}
          placeholder="What is this event about? Who should attend?"
          value={form.description}
          onChange={handleChange}
          error={errors.description}
        />

        <FormField
          label="Venue"
          name="venue"
          placeholder="Tech Park Auditorium, Bengaluru"
          value={form.venue}
          onChange={handleChange}
          error={errors.venue}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Date & time"
            name="startsAt"
            type="datetime-local"
            value={form.startsAt}
            onChange={handleChange}
            error={errors.startsAt}
          />

          <FormField
            label="Capacity (seats)"
            name="capacity"
            type="number"
            min="1"
            step="1"
            placeholder="50"
            value={form.capacity}
            onChange={handleChange}
            error={errors.capacity}
            hint={isEditMode ? `Minimum allowed: ${seatsBooked}` : undefined}
          />
        </div>

        <FormField
          label="Ticket price (₹)"
          name="price"
          type="number"
          min="0"
          step="1"
          placeholder="0"
          value={form.price}
          onChange={handleChange}
          error={errors.price}
          hint="Enter 0 to make this a free event."
        />

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => navigate('/organizer')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Create event'}
          </button>
        </div>
      </form>
    </div>
  );
}