import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

export default function ProtectedRoute({
  children,
  organizerOnly = false,
}: {
  children: ReactNode;
  organizerOnly?: boolean;
}) {
  const { isLoggedIn, isOrganizer, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner label="Checking your session…" />;

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (organizerOnly && !isOrganizer) return <Navigate to="/" replace />;

  return <>{children}</>;
}