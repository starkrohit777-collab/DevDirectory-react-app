import { useEffect, useState } from 'react';
import { getUsers, createPost, errorMessage } from '../services/postService';
import AlertBanner from '../components/AlertBanner.jsx';

const initial = { userId: '', title: '', body: '' };

export default function AddPost() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [loadError, setLoadError] = useState('');

  const loadUsers = () => { setLoadError(''); getUsers().then(setUsers).catch((e) => setLoadError(errorMessage(e))); };
  useEffect(() => { loadUsers(); }, []);

  const t = form.title.trim().length, b = form.body.trim().length;
  const errors = {};
  if (!form.userId) errors.userId = 'Choose an author.';
  if (t < 5 || t > 80) errors.title = 'Title must be 5–80 characters.';
  if (b < 20 || b > 500) errors.body = 'Body must be 20–500 characters.';
  const valid = Object.keys(errors).length === 0;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const blur = (k) => () => setTouched({ ...touched, [k]: true });

  const submit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true); setStatus(null);
    try {
      const res = await createPost({ title: form.title.trim(), body: form.body.trim(), userId: Number(form.userId) });
      if (res.status === 201) {
        setStatus({ type: 'success', message: `Post published (id ${res.data.id}).`, k: Date.now() });
        setForm(initial); setTouched({});
      }
    } catch (err) {
      setStatus({ type: 'error', message: errorMessage(err), k: Date.now() });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="narrow">
      <h1>New post</h1>
      <p className="muted">Share documentation or an update with the team.</p>
      {loadError && <AlertBanner message={loadError} onRetry={loadUsers} />}
      {status && <AlertBanner key={status.k} type={status.type} message={status.message} />}
      <form className="card form" onSubmit={submit} noValidate>
        <label>Author
          <select value={form.userId} onChange={set('userId')} onBlur={blur('userId')}>
            <option value="">Select a developer</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          {touched.userId && errors.userId && <em className="field-error">{errors.userId}</em>}
        </label>
        <label>Title
          <input value={form.title} onChange={set('title')} onBlur={blur('title')} maxLength={80} placeholder="e.g. Migrating our build to Vite" />
          <span className="hint">{t}/80</span>
          {touched.title && errors.title && <em className="field-error">{errors.title}</em>}
        </label>
        <label>Body
          <textarea rows={6} value={form.body} onChange={set('body')} onBlur={blur('body')} maxLength={500} placeholder="What should the team know?" />
          <span className="hint">{b}/500</span>
          {touched.body && errors.body && <em className="field-error">{errors.body}</em>}
        </label>
        <button className="btn btn-primary btn-lg" disabled={!valid || submitting}>{submitting ? 'Publishing…' : 'Publish post'}</button>
      </form>
    </div>
  );
}
