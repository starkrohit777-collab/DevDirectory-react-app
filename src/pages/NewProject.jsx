import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { STATUSES } from '../utils/workspace.js';
import AlertBanner from '../components/AlertBanner.jsx';

const initial = {
  name: '',
  tagline: '',
  description: '',
  tags: '',
  repo: '',
  demoUrl: '',
  status: 'Planning',
};

export default function NewProject() {
  const { createProject } = useWorkspace();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const blur = (k) => () => setTouched({ ...touched, [k]: true });

  const errors = {};
  if (form.name.trim().length < 3 || form.name.trim().length > 60) {
    errors.name = 'Name must be 3–60 characters.';
  }
  if (form.tagline.trim().length < 5 || form.tagline.trim().length > 90) {
    errors.tagline = 'Tagline must be 5–90 characters.';
  }
  if (form.description.trim().length < 20 || form.description.trim().length > 600) {
    errors.description = 'Description must be 20–600 characters.';
  }
  if (form.repo.trim() && !/^https?:\/\//i.test(form.repo.trim())) {
    errors.repo = 'Repository link must start with http:// or https://';
  }
  if (form.demoUrl.trim() && !/^https?:\/\//i.test(form.demoUrl.trim())) {
    errors.demoUrl = 'Live demo URL must start with http:// or https://';
  }
  const valid = Object.keys(errors).length === 0;

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!valid) {
      setTouched({
        name: true,
        tagline: true,
        description: true,
        repo: true,
        demoUrl: true,
      });
      return;
    }

    setSubmitting(true);
    try {
      const id = createProject(
        {
          ...form,
          name: form.name.trim(),
          tagline: form.tagline.trim(),
          description: form.description.trim(),
          repo: form.repo.trim(),
          demoUrl: form.demoUrl.trim(),
          tags: form.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 6),
        },
        user
      );
      navigate(`/projects/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to create project. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="narrow ws-narrow">
      <Link to="/projects" className="back">← All projects</Link>
      <h1 className="ws-h1">Start a project</h1>
      <p className="muted">
        You become the project lead. Your new project is automatically tracked in the backend database with task boards, discussion threads, activity logs, and team management.
      </p>

      {error && <AlertBanner message={error} onRetry={() => setError('')} />}

      <form className="card form" onSubmit={submit} noValidate>
        <label>
          Project name
          <input
            value={form.name}
            onChange={set('name')}
            onBlur={blur('name')}
            maxLength={60}
            placeholder="e.g. Community Bug Tracker"
            disabled={submitting}
          />
          {touched.name && errors.name && <em className="field-error">{errors.name}</em>}
        </label>

        <label>
          Tagline
          <input
            value={form.tagline}
            onChange={set('tagline')}
            onBlur={blur('tagline')}
            maxLength={90}
            placeholder="One line describing the core goal"
            disabled={submitting}
          />
          {touched.tagline && errors.tagline && <em className="field-error">{errors.tagline}</em>}
        </label>

        <label>
          Description
          <textarea
            rows={5}
            value={form.description}
            onChange={set('description')}
            onBlur={blur('description')}
            maxLength={600}
            placeholder="What problem does it solve and who is it for?"
            disabled={submitting}
          />
          <span className="hint">{form.description.trim().length}/600</span>
          {touched.description && errors.description && <em className="field-error">{errors.description}</em>}
        </label>

        <label>
          Tags <span className="hint-inline">(comma separated, up to 6)</span>
          <input
            value={form.tags}
            onChange={set('tags')}
            placeholder="React, Open source, TypeScript, Cloud"
            disabled={submitting}
          />
        </label>

        <label>
          Repository link <span className="hint-inline">(optional)</span>
          <input
            value={form.repo}
            onChange={set('repo')}
            onBlur={blur('repo')}
            placeholder="https://github.com/your-username/project-repo"
            disabled={submitting}
          />
          {touched.repo && errors.repo && <em className="field-error">{errors.repo}</em>}
        </label>

        <label>
          Live Demo URL <span className="hint-inline">(optional)</span>
          <input
            value={form.demoUrl}
            onChange={set('demoUrl')}
            onBlur={blur('demoUrl')}
            placeholder="https://myproject.dev"
            disabled={submitting}
          />
          {touched.demoUrl && errors.demoUrl && <em className="field-error">{errors.demoUrl}</em>}
        </label>

        <label>
          Starting status
          <select value={form.status} onChange={set('status')} disabled={submitting}>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>

        <button className="btn btn-primary btn-lg" type="submit" disabled={submitting}>
          {submitting ? 'Creating & Tracking Project…' : 'Create project'}
        </button>
      </form>
    </div>
  );
}
