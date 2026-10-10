import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <Link to="/" className="brand"><span className="brand-mark">{'{ }'}</span> DevDirectory</Link>
          <p className="muted small">Discover colleagues and share engineering notes.</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link to="/">Home</Link>
          <Link to="/users">Developers</Link>
          <Link to="/add-post">New post</Link>
          <Link to="/login">Log in</Link>
        </nav>
        <p className="muted small">Data by JSONPlaceholder<br />© {new Date().getFullYear()} DevDirectory</p>
      </div>
    </footer>
  );
}
