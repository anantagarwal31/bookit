import { Route, Routes } from 'react-router-dom';
import EventDetailPage from './pages/EventDetailPage';
import EventsPage from './pages/EventsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  );
}