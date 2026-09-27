import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyBookingsPage from './pages/MyBookingsPage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage';
import EventFormPage from './pages/EventFormPage';
import EventInsightsPage from './pages/EventInsightsPage';
import NotFoundPage from './pages/NotFoundPage';

/** All application routes live here, grouped by who may access them. */
export default function App() {
  return (
    <>
      <Navbar />

      <main className="min-h-[calc(100vh-140px)] pb-10">
        <Routes>
          {/* Public */}
          <Route path="/" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Logged-in users */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          {/* Organizers only */}
          <Route
            path="/organizer"
            element={
              <ProtectedRoute organizerOnly>
                <OrganizerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/new"
            element={
              <ProtectedRoute organizerOnly>
                <EventFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/:id/edit"
            element={
              <ProtectedRoute organizerOnly>
                <EventFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/:id"
            element={
              <ProtectedRoute organizerOnly>
                <EventInsightsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-sm text-slate-500">
        <div className="mx-auto max-w-6xl px-4">BookIt — a full-stack event booking demo.</div>
      </footer>
    </>
  );
}
