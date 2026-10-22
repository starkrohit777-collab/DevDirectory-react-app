import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function NewProblem() {
  const { addProblem, projects } = useWorkspace();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ title: '', body: '', tags: '', projectId: params.get('project') || '' });
  const [touched, setTouched] = useState({});
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const blur = (k) => () => setTouched({ ...touched, [k]: true });

  const errors = {};
  if (form.title.trim().length < 10 || form.title.trim().length > 120) errors.title = 'Title must be 10–120 characters.';
  if (form.body.trim().length < 30 || form.body.trim().length > 1200) errors.body = 'Describe the problem in 30–1200 characters.';
  const valid = !Object.keys(errors).length;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    const id = addProblem({
      title: form.title.trim(), body: form.body.trim(), projectId: form.projectId,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 5),
    }, user);
    navigate(`/community/${id}`);
  };

  return (
    <div className="narrow ws-narrow">
      <Link to="/community" className="back">← Community help</Link>
      <h1 className="ws-h1">Ask the community</h1>
      <p className="muted">Share the problem, what you tried, and what a good answer would look like.</p>
      <form className="card form" onSubmit={submit} noValidate>
        <label>Problem title
          <input value={form.title} onChange={set('title')} onBlur={blur('title')} maxLength={120} placeholder="e.g. How do we keep releases calm when the team is small?" />
          {touched.title && errors.title && <em className="field-error">{errors.title}</em>}
        </label>
        <label>Details
          <textarea rows={7} value={form.body} onChange={set('body')} onBlur={blur('body')} maxLength={1200} placeholder="Context, what you tried, constraints…" />
          <span className="hint">{form.body.trim().length}/1200</span>
          {touched.body && errors.body && <em className="field-error">{errors.body}</em>}
        </label>
        <label>Tags <span className="hint-inline">(comma separated)</span><input value={form.tags} onChange={set('tags')} placeholder="Process, Career, Architecture" /></label>
        <label>Related project <span className="hint-inline">(optional)</span>
          <select value={form.projectId} onChange={set('projectId')}>
            <option value="">None</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <button className="btn btn-primary btn-lg" disabled={!valid}>Post question</button>
      </form>
    </div>
  );
}
