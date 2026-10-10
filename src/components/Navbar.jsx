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

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand"><span className="brand-mark">{'{ }'}</span> DevDirectory</Link>
        <nav className="nav-links" aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/users">Developers</NavLink>
          <NavLink to="/add-post">New post</NavLink>
        </nav>
        <form className="nav-search" onSubmit={search} role="search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search developers" aria-label="Search developers" />
        </form>
        {isAuthenticated ? (
          <div className="nav-user">
            <span className="hide-sm">{user.name}</span>
            <button className="btn btn-ghost" onClick={() => { logout(); navigate('/'); }}>Log out</button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary">Log in</Link>
        )}
      </div>
    </header>
  );
}
