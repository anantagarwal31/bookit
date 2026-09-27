import { Link } from 'react-router-dom';
import { formatDateTime, formatPrice } from '../utils/format';
import type { EventSummary } from '../types';

export default function EventCard({ event }: { event: EventSummary }) {
  const isSoldOut = event.is_sold_out;
  const isFillingFast =
    !isSoldOut &&
    event.seats_remaining <= Math.max(3, event.capacity * 0.1);

  return (
    <Link to={`/events/${event.id}`} className="block">
      <article
        className={`card flex flex-col gap-2 p-6 transition-all hover:-translate-y-0.5 hover:shadow-md ${
          isSoldOut ? 'opacity-80' : ''
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <time
            className="text-xs font-semibold text-brand-600"
            dateTime={event.starts_at}
          >
            {formatDateTime(event.starts_at)}
          </time>

          {isSoldOut && (
            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
              Sold out
            </span>
          )}

          {isFillingFast && (
            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
              Only {event.seats_remaining} left
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold leading-snug">{event.title}</h3>

        <p className="text-sm text-slate-500">{event.venue}</p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-200 pt-3">
          <span className="font-bold">{formatPrice(event.price_cents)}</span>

          <span className="text-xs text-slate-500">
            {isSoldOut
              ? '0 seats left'
              : `${event.seats_remaining} of ${event.capacity} seats left`}
          </span>
        </div>
      </article>
    </Link>
  );
}