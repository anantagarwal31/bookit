import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <EmptyState
        title="Page not found"
        message="The page you are looking for does not exist or has been moved."
        action={
          <Link className="btn-primary" to="/">
            Go to events
          </Link>
        }
      />
    </div>
  );
}