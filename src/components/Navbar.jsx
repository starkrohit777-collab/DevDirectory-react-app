import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [term, setTerm] = useState('');

  const search = (e) => {
    e.preventDefault();
    const q = term.trim();
    navigate(q ? `/users?q=${encodeURIComponent(q)}` : '/users');
    setTerm('');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">{'{ }'}</span> DevDirectory
        </Link>

        <nav className="nav-links" aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/users">Developers</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/community">Community</NavLink>
          <NavLink to="/add-post">New post</NavLink>
        </nav>

        <form className="nav-search" onSubmit={search} role="search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search developers"
            aria-label="Search developers"
          />
        </form>

        {isAuthenticated ? (
          <div className="nav-user" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              to="/projects/new"
              className="btn btn-ghost btn-small hide-sm"
              style={{ border: '1px solid rgba(197, 251, 103, 0.3)', color: '#c5fb67' }}
            >
              + Project
            </Link>

            <div
              className="nav-profile-badge"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              title={user.email}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '700',
                }}
              >
                {initials}
              </div>
              <span className="hide-sm" style={{ fontWeight: '500' }}>{user.name}</span>
            </div>

            <button
              className="btn btn-ghost btn-small"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
            >
              Log out
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/login" className="btn btn-ghost">Log in</Link>
            <Link to="/signup" className="btn btn-primary">Sign up</Link>
          </div>
        )}
      </div>
    </header>
  );
}
