import { Route, Routes } from 'react-router-dom';
import EventDetailPage from './pages/EventDetailPage';
import EventsPage from './pages/EventsPage';
import LoginPage from './pages/LoginPage';
import MyBookingsPage from './pages/MyBookingsPage';
import SignupPage from './pages/SignupPage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/my-bookings" element={<MyBookingsPage />} />
      <Route path="/organizer" element={<OrganizerDashboardPage />} />
    </Routes>
  );
}