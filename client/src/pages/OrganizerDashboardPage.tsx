import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { organizerApi } from '../api/endpoints';
import { formatDateTime, formatPrice } from '../utils/format';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import type { OrganizerEvent } from '../types';

/** Lists the organizer's own events with how many seats each has sold. */
export default function OrganizerDashboardPage() {
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    organizerApi
      .myEvents()
      .then((data) => setEvents(data.events))
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, []);

  const totals = events.reduce(
    (sum, event) => ({
      seatsSold: sum.seatsSold + event.seats_booked,
      revenueCents: sum.revenueCents + Number(event.revenue_cents),
    }),
    { seatsSold: 0, revenueCents: 0 }
  );

  if (isLoading) return <Spinner label="Loading your events…" />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <PageHeader
        title="Organizer dashboard"
        subtitle={`${events.length} event(s) · ${totals.seatsSold} seats sold · ${formatPrice(
          totals.revenueCents
        )} revenue`}
        action={
          <Link className="btn-primary" to="/organizer/events/new">
            + Create event
          </Link>
        }
      />

      <Alert type="error" onClose={() => setError('')}>
        {error}
      </Alert>

      {events.length === 0 ? (
        <EmptyState
          title="You have not created any events"
          message="Create your first event and start selling seats."
          action={
            <Link className="btn-primary" to="/organizer/events/new">
              Create event
            </Link>
          }
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className="table-head">Event</th>
                <th className="table-head">Date &amp; time</th>
                <th className="table-head">Sold</th>
                <th className="table-head">Price</th>
                <th className="table-head">Revenue</th>
                <th className="table-head" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="table-cell">
                    <Link className="font-semibold hover:text-brand-600" to={`/events/${event.id}`}>
                      {event.title}
                    </Link>
                    <div className="text-xs text-slate-500">{event.venue}</div>
                  </td>
                  <td className="table-cell">{formatDateTime(event.starts_at)}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <span>
                        {event.seats_booked} / {event.capacity}
                      </span>
                      {event.is_sold_out && <Badge tone="danger">Sold out</Badge>}
                    </div>
                  </td>
                  <td className="table-cell">{formatPrice(event.price_cents)}</td>
                  <td className="table-cell">{formatPrice(Number(event.revenue_cents))}</td>
                  <td className="table-cell">
                    <div className="flex gap-1">
                      <Link className="btn-ghost btn-sm" to={`/organizer/events/${event.id}`}>
                        Insights
                      </Link>
                      <Link
                        className="btn-secondary btn-sm"
                        to={`/organizer/events/${event.id}/edit`}
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
