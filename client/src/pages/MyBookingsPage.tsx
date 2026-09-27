import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingsApi } from '../api/endpoints';
import { formatDateTime, formatPrice } from '../utils/format';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import type { BookingWithEvent } from '../types';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [bookingToCancel, setBookingToCancel] =
    useState<BookingWithEvent | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  function loadBookings(): void {
    setIsLoading(true);

    bookingsApi
      .mine()
      .then((data) => setBookings(data.bookings))
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(loadBookings, []);

  async function handleCancelConfirmed(): Promise<void> {
    if (!bookingToCancel) return;

    setIsCancelling(true);
    setError('');

    try {
      await bookingsApi.cancel(bookingToCancel.id);

      setSuccessMessage(
        `Your booking for "${bookingToCancel.title}" was cancelled.`
      );

      setBookingToCancel(null);
      loadBookings();
    } catch (requestError) {
      setError((requestError as Error).message);
      setBookingToCancel(null);
    } finally {
      setIsCancelling(false);
    }
  }

  if (isLoading) {
    return <Spinner label="Loading your bookings…" />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <PageHeader
        title="My bookings"
        subtitle="Every seat you have reserved."
      />

      <Alert type="error" onClose={() => setError('')}>
        {error}
      </Alert>

      <Alert
        type="success"
        onClose={() => setSuccessMessage('')}
      >
        {successMessage}
      </Alert>

      {bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          message="Once you book a seat it will appear here."
          action={
            <Link className="btn-primary" to="/">
              Browse events
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {bookings.map((booking) => {
            const isCancelled = booking.status === 'cancelled';
            const hasStarted =
              new Date(booking.starts_at).getTime() <= Date.now();

            return (
              <li
                key={booking.id}
                className={`card flex flex-wrap items-center justify-between gap-4 p-6 ${
                  isCancelled ? 'opacity-70' : ''
                }`}
              >
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Link
                      className="text-base font-semibold hover:text-brand-600"
                      to={`/events/${booking.event_id}`}
                    >
                      {booking.title}
                    </Link>

                    <Badge tone={isCancelled ? 'neutral' : 'success'}>
                      {isCancelled ? 'Cancelled' : 'Confirmed'}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-500">
                    {formatDateTime(booking.starts_at)} · {booking.venue}
                  </p>

                  <p className="text-xs text-slate-500">
                    Booking #{booking.id} ·{' '}
                    {formatPrice(booking.price_cents)}
                  </p>
                </div>

                <div className="w-full sm:w-auto">
                  {!isCancelled && !hasStarted && (
                    <button
                      type="button"
                      className="btn-danger-outline w-full sm:w-auto"
                      onClick={() => setBookingToCancel(booking)}
                    >
                      Cancel booking
                    </button>
                  )}

                  {!isCancelled && hasStarted && (
                    <span className="text-xs text-slate-500">
                      Event started
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        isOpen={Boolean(bookingToCancel)}
        title="Cancel this booking?"
        message={
          bookingToCancel
            ? `Your seat for "${bookingToCancel.title}" will be released and someone else can take it.`
            : ''
        }
        confirmLabel="Yes, cancel it"
        isBusy={isCancelling}
        onConfirm={handleCancelConfirmed}
        onCancel={() => setBookingToCancel(null)}
      />
    </div>
  );
}