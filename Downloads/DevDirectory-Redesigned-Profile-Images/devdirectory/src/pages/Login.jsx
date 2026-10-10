import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (isAuthenticated) return <Navigate to={from} replace />;

  const submit = (e) => {
    e.preventDefault();
    login({ name: name.trim(), email: email.trim() });
    navigate(from, { replace: true });
  };

  return (
    <div className="narrow">
      <h1>Welcome back</h1>
      <p className="muted">{location.state?.from ? `Log in to continue to ${from}` : 'Log in to publish posts.'}</p>
      <form className="card form" onSubmit={submit}>
        <label>Name<input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="Asha Verma" /></label>
        <label>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="asha@company.dev" /></label>
        <button className="btn btn-primary btn-lg" type="submit">Log in</button>
        <p className="muted small">This is a simulated session. Any name and email will work.</p>
      </form>
    </div>
  );
}
