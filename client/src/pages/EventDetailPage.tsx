import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { eventsApi } from '../api/endpoints';
import { formatDateTime, formatPrice } from '../utils/format';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import type { EventDetail } from '../types';

const AVAILABILITY_REFRESH_MS = 10_000;

export default function EventDetailPage() {
  const { id = '' } = useParams();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isCurrentRequest = true;

    setIsLoading(true);
    setLoadError('');

    eventsApi
      .detail(id)
      .then((data) => {
        if (isCurrentRequest) {
          setEvent(data.event);
        }
      })
      .catch((error: Error) => {
        if (isCurrentRequest) {
          setLoadError(error.message);
        }
      })
      .finally(() => {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      eventsApi
        .availability(id)
        .then((data) => {
          setEvent((current) =>
            current
              ? {
                  ...current,
                  ...data.availability,
                }
              : current
          );
        })
        .catch(() => {});
    }, AVAILABILITY_REFRESH_MS);

    return () => clearInterval(timer);
  }, [id]);

  if (isLoading && !event) {
    return <Spinner label="Loading event…" />;
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Alert type="error">{loadError}</Alert>

        <Link className="btn-secondary" to="/">
          Back to all events
        </Link>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const isSoldOut = event.seats_remaining <= 0;
  const filledPercent = Math.min(
    (event.seats_booked / event.capacity) * 100,
    100
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link className="mb-4 inline-block text-sm text-brand-600" to="/">
        ← Back to all events
      </Link>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="card p-6 sm:p-8">
          <div className="mb-2 flex gap-2">
            {isSoldOut && <Badge tone="danger">Sold out</Badge>}
          </div>

          <h1 className="mb-6 text-2xl font-bold sm:text-3xl">
            {event.title}
          </h1>

          <dl className="mb-6 grid gap-4 border-b border-slate-200 pb-6 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">
                When
              </dt>
              <dd className="text-sm font-semibold">
                {formatDateTime(event.starts_at)}
              </dd>
            </div>

            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">
                Where
              </dt>
              <dd className="text-sm font-semibold">{event.venue}</dd>
            </div>

            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">
                Organised by
              </dt>
              <dd className="text-sm font-semibold">
                {event.organizer_name}
              </dd>
            </div>
          </dl>

          <h2 className="mb-2 text-lg font-semibold">
            About this event
          </h2>

          <p className="whitespace-pre-line text-slate-600">
            {event.description}
          </p>
        </article>

        <aside className="card p-6 shadow-md lg:sticky lg:top-24">
          <p className="mb-4 text-2xl font-bold">
            {formatPrice(event.price_cents)}
          </p>

          <div className="mb-4">
            <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-brand-600 transition-all duration-300"
                style={{ width: `${filledPercent}%` }}
              />
            </div>

            <p className="text-sm">
              <strong>
                {Math.max(event.seats_remaining, 0)}
              </strong>{' '}
              of {event.capacity} seats left
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Updates automatically every 10 seconds
            </p>
          </div>

          {isSoldOut && (
            <Alert type="error">
              This event is sold out.
            </Alert>
          )}
        </aside>
      </div>
    </div>
  );
}