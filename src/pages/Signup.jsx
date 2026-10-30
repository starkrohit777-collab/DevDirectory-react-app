import { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AlertBanner from '../components/AlertBanner.jsx';

const initialForm = {
  name: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  role: '',
  skills: '',
  bio: '',
};

export default function Signup() {
  const { isAuthenticated, signup, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/projects';

  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated && !authLoading) return <Navigate to={from} replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const blur = (k) => () => setTouched({ ...touched, [k]: true });

  const errors = {};
  if (form.name.trim().length < 2) errors.name = 'Full name must be at least 2 characters.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (form.username.trim() && !/^[a-zA-Z0-9_-]{2,20}$/.test(form.username.trim())) {
    errors.username = 'Username must be 2–20 alphanumeric characters (or _ / -).';
  }
  if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.';
  if (form.confirmPassword && form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  const valid =
    form.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    form.password.length >= 6 &&
    form.password === form.confirmPassword &&
    !errors.username;

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!valid) {
      setTouched({
        name: true,
        email: true,
        username: true,
        password: true,
        confirmPassword: true,
      });
      return;
    }

    setSubmitting(true);
    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        username: form.username.trim() || form.email.split('@')[0],
        password: form.password,
        role: form.role.trim() || 'Software Developer',
        skills: form.skills,
        bio: form.bio.trim(),
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="narrow">
      <Link to="/login" className="back">← Back to log in</Link>
      <h1>Join DevDirectory</h1>
      <p className="muted">
        Create an account to start new projects, lead development teams, collaborate on code, and share community solutions.
      </p>

      {error && <AlertBanner message={error} onRetry={() => setError('')} />}

      <form className="card form" onSubmit={submit} noValidate>
        <label>
          Full Name
          <input
            required
            value={form.name}
            onChange={set('name')}
            onBlur={blur('name')}
            placeholder="e.g. Alex Morgan"
            disabled={submitting}
          />
          {touched.name && errors.name && <em className="field-error">{errors.name}</em>}
        </label>

        <label>
          Email address
          <input
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
            onBlur={blur('email')}
            placeholder="alex@example.dev"
            disabled={submitting}
          />
          {touched.email && errors.email && <em className="field-error">{errors.email}</em>}
        </label>

        <label>
          Username <span className="hint-inline">(optional)</span>
          <input
            value={form.username}
            onChange={set('username')}
            onBlur={blur('username')}
            placeholder="alexmorgan"
            disabled={submitting}
          />
          {touched.username && errors.username && <em className="field-error">{errors.username}</em>}
        </label>

        <label>
          <div className="form-row">
            <span>Password (min. 6 characters)</span>
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
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
            onBlur={blur('password')}
            placeholder="••••••••"
            disabled={submitting}
          />
          {touched.password && errors.password && <em className="field-error">{errors.password}</em>}
        </label>

        <label>
          Confirm Password
          <input
            required
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            onBlur={blur('confirmPassword')}
            placeholder="••••••••"
            disabled={submitting}
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <em className="field-error">{errors.confirmPassword}</em>
          )}
        </label>

        <label>
          Professional Role / Title <span className="hint-inline">(optional)</span>
          <input
            value={form.role}
            onChange={set('role')}
            placeholder="e.g. Frontend Engineer · Open Source Enthusiast"
            disabled={submitting}
          />
        </label>

        <label>
          Primary Skills <span className="hint-inline">(comma separated)</span>
          <input
            value={form.skills}
            onChange={set('skills')}
            placeholder="React, TypeScript, Node.js, GraphQL"
            disabled={submitting}
          />
        </label>

        <label>
          Short Bio <span className="hint-inline">(optional)</span>
          <textarea
            rows={3}
            value={form.bio}
            onChange={set('bio')}
            placeholder="Tell other makers what you build and what you are passionate about…"
            disabled={submitting}
          />
        </label>

        <button className="btn btn-primary btn-lg" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up & start building'}
        </button>

        <div className="form-foot">
          <span className="muted small">Already registered? </span>
          <Link to="/login" className="text-link small" state={{ from: location.state?.from }}>
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
}
