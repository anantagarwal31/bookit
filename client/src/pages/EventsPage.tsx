import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventsApi } from '../api/endpoints';
import EventCard from '../components/EventCard';
import SearchFilters from '../components/SearchFilters';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import type { EventSummary, PaginationInfo } from '../types';

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const date = searchParams.get('date') ?? '';
  const page = Number(searchParams.get('page') ?? 1);

  const [events, setEvents] = useState<EventSummary[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrentRequest = true;

    setIsLoading(true);
    setError('');

    eventsApi
      .list({ search, date, page })
      .then((data) => {
        if (!isCurrentRequest) return;

        setEvents(data.events);
        setPagination(data.pagination);
      })
      .catch((requestError: Error) => {
        if (isCurrentRequest) {
          setError(requestError.message);
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
  }, [search, date, page]);

  function handleFilterChange(next: {
    search: string;
    date: string;
  }): void {
    const params: Record<string, string> = {};

    if (next.search) params.search = next.search;
    if (next.date) params.date = next.date;

    setSearchParams(params);
  }

  function handlePageChange(nextPage: number): void {
    const params: Record<string, string> = {};

    if (search) params.search = search;
    if (date) params.date = date;
    if (nextPage > 1) params.page = String(nextPage);

    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <PageHeader
        title="Upcoming events"
        subtitle={
          pagination.total > 0
            ? `${pagination.total} event${
                pagination.total === 1 ? '' : 's'
              } available`
            : 'Find something to attend'
        }
      />

      <SearchFilters
        search={search}
        date={date}
        onChange={handleFilterChange}
      />

      <Alert type="error" onClose={() => setError('')}>
        {error}
      </Alert>

      {isLoading ? (
        <Spinner label="Loading events…" />
      ) : events.length === 0 ? (
        <EmptyState
          title="No events found"
          message={
            search || date
              ? 'Try a different search term or clear the date filter.'
              : 'There are no upcoming events right now. Please check back soon.'
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}