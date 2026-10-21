import { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AlertBanner from '../components/AlertBanner.jsx';

export default function Login() {
  const { isAuthenticated, login, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated && !authLoading) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: cleanEmail, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="narrow">
      <Link to="/" className="back">← Back to home</Link>
      <h1>Welcome back</h1>
      <p className="muted">
        {location.state?.from
          ? `Log in to continue to ${from}`
          : 'Log in to manage your workspaces, track projects, and collaborate.'}
      </p>

      {error && <AlertBanner message={error} onRetry={() => setError('')} />}

      <form className="card form" onSubmit={submit} noValidate>
        <label>
          Email address
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="asha@company.dev"
            disabled={submitting}
          />
        </label>

        <label>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Password</span>
            <button
              type="button"
              className="ws-linkbtn small"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? 'Hide password' : 'Show password'}
            </button>
          </div>
          <input
            required
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={submitting}
          />
        </label>

        <button className="btn btn-primary btn-lg" type="submit" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <span className="muted small">Don't have an account yet? </span>
          <Link to="/signup" className="text-link small" state={{ from: location.state?.from }}>
            Create one here ↗
          </Link>
        </div>

        <div className="card-bottom" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border, #262933)' }}>
          <p className="muted small" style={{ marginBottom: '8px' }}>
            <b>Quick Demo Accounts</b> (password: <code style={{ color: '#c5fb67' }}>password123</code>):
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={() => fillDemoAccount('asha@company.dev')}
            >
              Asha Verma (Lead)
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={() => fillDemoAccount('sarah@devdirectory.dev')}
            >
              Sarah Drasner (UI Kit Lead)
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={() => fillDemoAccount('dan@example.dev')}
            >
              Dan Abramov (Core Dev)
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
