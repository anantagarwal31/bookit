import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { organizerApi } from '../api/endpoints';
import { formatDate, formatDateTime } from '../utils/format';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import type { Attendee, EventAnalytics, OwnedEvent } from '../types';

export default function EventInsightsPage() {
  const { id = '' } = useParams();

  const [event, setEvent] = useState<OwnedEvent | null>(null);
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([organizerApi.analytics(id), organizerApi.attendees(id)])
      .then(([analyticsData, attendeesData]) => {
        setEvent(analyticsData.event);
        setAnalytics(analyticsData.analytics);
        setAttendees(attendeesData.attendees);
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <Spinner label="Loading insights…" />;

  if (error || !event || !analytics) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Alert type="error">{error || 'Could not load this event.'}</Alert>
        <Link className="btn-secondary" to="/organizer">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const confirmedAttendees = attendees.filter(
    (attendee) => attendee.status === 'confirmed'
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link className="mb-4 inline-block text-sm text-brand-600" to="/organizer">
        ← Back to dashboard
      </Link>

      <PageHeader
        title={event.title}
        subtitle={`${formatDateTime(event.starts_at)} · ${event.venue}`}
        action={
          <Link className="btn-secondary" to={`/organizer/events/${id}/edit`}>
            Edit event
          </Link>
        }
      />

      <section aria-labelledby="analytics-heading">
        <h2 className="mb-4 text-lg font-semibold" id="analytics-heading">
          Analytics
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total views"
            value={analytics.views}
            helpText="Event page opened"
          />
          <StatCard
            label="Bookings started"
            value={analytics.bookingsStarted}
            helpText="Clicked “Book a seat”"
          />
          <StatCard
            label="Bookings confirmed"
            value={analytics.bookingsConfirmed}
            helpText="Seats actually reserved"
            tone="success"
          />
          <StatCard
            label="View → booking rate"
            value={`${analytics.viewToBookingRate}%`}
            helpText="Confirmed bookings ÷ views"
            tone="primary"
          />
        </div>

        <p className="mt-4 text-sm text-slate-500">
          {analytics.bookingsCancelled} cancellation(s) ·{' '}
          {analytics.startToBookingRate}% of started bookings were completed ·
          seats sold {event.seats_booked}/{event.capacity}
        </p>
      </section>

      <section aria-labelledby="attendees-heading">
        <h2 className="mb-4 mt-10 text-lg font-semibold" id="attendees-heading">
          Attendees ({confirmedAttendees.length} confirmed)
        </h2>

        {attendees.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            message="Attendees will appear here as seats are booked."
          />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr>
                  <th className="table-head">Name</th>
                  <th className="table-head">Email</th>
                  <th className="table-head">Booked on</th>
                  <th className="table-head">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((attendee) => (
                  <tr key={attendee.booking_id}>
                    <td className="table-cell font-medium">{attendee.name}</td>
                    <td className="table-cell text-slate-500">{attendee.email}</td>
                    <td className="table-cell">{formatDate(attendee.booked_at)}</td>
                    <td className="table-cell">
                      <Badge tone={attendee.status === 'confirmed' ? 'success' : 'neutral'}>
                        {attendee.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}