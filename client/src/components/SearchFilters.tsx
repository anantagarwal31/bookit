import { useEffect, useState } from 'react';

interface Filters {
  search: string;
  date: string;
}

interface SearchFiltersProps {
  search: string;
  date: string;
  onChange: (filters: Filters) => void;
}

export default function SearchFilters({
  search,
  date,
  onChange,
}: SearchFiltersProps) {
  const [searchText, setSearchText] = useState(search);

  useEffect(() => {
    setSearchText(search);
  }, [search]);

  useEffect(() => {
    if (searchText === search) return undefined;

    const timer = setTimeout(() => {
      onChange({ search: searchText, date });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchText]);

  const hasFilters = Boolean(search || date);

  return (
    <form
      className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
      onSubmit={(event) => event.preventDefault()}
      role="search"
    >
      <div className="flex-1">
        <label
          className="mb-1 block text-sm font-medium text-slate-700"
          htmlFor="search"
        >
          Search events
        </label>

        <input
          id="search"
          type="search"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          placeholder="Search by title, e.g. React"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </div>

      <div className="sm:w-48">
        <label
          className="mb-1 block text-sm font-medium text-slate-700"
          htmlFor="date"
        >
          On date
        </label>

        <input
          id="date"
          type="date"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={date}
          onChange={(event) =>
            onChange({
              search: searchText,
              date: event.target.value,
            })
          }
        />
      </div>

      {hasFilters && (
        <button
          type="button"
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          onClick={() => {
            setSearchText('');
            onChange({ search: '', date: '' });
          }}
        >
          Clear
        </button>
      )}
    </form>
  );
}