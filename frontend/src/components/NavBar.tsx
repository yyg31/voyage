import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tag } from './Tag';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/agenda', label: 'Agenda' },
  { to: '/stopovers', label: 'Stopovers' },
  { to: '/flights', label: 'Flights & transport' },
  { to: '/links', label: 'Links & hotels' },
  { to: '/forum', label: 'Forum' },
  { to: '/phrasebook', label: 'Phrasebook' },
];

export function NavBar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-title">asia26</span>
        <Tag label={user.family?.name ?? ''} color={user.family?.colorHex} />
      </div>
      <nav className="navbar-links">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            {l.label}
          </NavLink>
        ))}
        {user.role === 'ADMIN' && (
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
            Admin
          </NavLink>
        )}
      </nav>
      <div className="navbar-user">
        <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
          {user.firstName} {user.lastName}
        </NavLink>
        <button className="btn-link" onClick={logout}>
          Sign out
        </button>
      </div>
    </header>
  );
}
