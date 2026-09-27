import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Top navigation. Collapses into a toggle menu on small screens. */
export default function Navbar() {
  const { user, isLoggedIn, isOrganizer, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = (): void => setIsMenuOpen(false);

  async function handleLogout(): Promise<void> {
    await logout();
    closeMenu();
    navigate('/');
  }

  /** NavLink gives us an `isActive` flag we turn into Tailwind classes. */
  const linkClass = ({ isActive }: { isActive: boolean }): string =>
    `border-b-2 py-1 text-sm font-medium transition-colors ${
      isActive
        ? 'border-brand-600 text-brand-600'
        : 'border-transparent text-slate-500 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-4 px-4">
        <Link to="/" className="text-xl font-bold" onClick={closeMenu}>
          Book<span className="text-brand-600">It</span>
        </Link>

        <button
          type="button"
          className="flex h-10 w-10 flex-col justify-center gap-1.5 rounded-md border border-slate-200 p-2.5 lg:hidden"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="h-0.5 rounded bg-slate-900" />
          <span className="h-0.5 rounded bg-slate-900" />
          <span className="h-0.5 rounded bg-slate-900" />
        </button>

        <nav
          className={`w-full flex-col items-start gap-4 pb-5 pt-2 lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-6 lg:py-0 ${
            isMenuOpen ? 'flex' : 'hidden'
          }`}
        >
          <NavLink to="/" end className={linkClass} onClick={closeMenu}>
            Browse events
          </NavLink>

          {isLoggedIn && (
            <NavLink to="/my-bookings" className={linkClass} onClick={closeMenu}>
              My bookings
            </NavLink>
          )}

          {isOrganizer && (
            <NavLink to="/organizer" className={linkClass} onClick={closeMenu}>
              Organizer dashboard
            </NavLink>
          )}

          {isLoggedIn && user ? (
            <div className="flex w-full items-center justify-between gap-2 lg:w-auto">
              <span className="flex flex-col text-sm font-semibold leading-tight">
                {user.name}
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  {user.role}
                </span>
              </span>
              <button type="button" className="btn-ghost" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <div className="flex w-full items-center gap-2 lg:w-auto">
              <Link to="/login" className="btn-ghost" onClick={closeMenu}>
                Log in
              </Link>
              <Link to="/signup" className="btn-primary" onClick={closeMenu}>
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
