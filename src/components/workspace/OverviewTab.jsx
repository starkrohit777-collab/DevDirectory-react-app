import { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { STATUSES, fmtDate, healthOf, progressOf, timeAgo } from '../../utils/workspace.js';
import { ProgressBar, Empty } from './Parts.jsx';

export default function OverviewTab({ project, lead, actor, onOpenTab }) {
  const { updateProject, addMilestone, toggleMilestone, deleteMilestone } = useWorkspace();
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const health = healthOf(project);
  const progress = progressOf(project);
  const counts = { total: project.tasks.length, done: project.tasks.filter((t) => t.status === 'done').length, blocked: project.tasks.filter((t) => t.blocked && t.status !== 'done').length };

  const submit = (e) => {
    e.preventDefault();
    if (title.trim().length < 3) return;
    addMilestone(project.id, { title: title.trim(), due }, actor);
    setTitle(''); setDue('');
  };

  return (
    <div className="ws-two-col">
      <div className="ws-col">
        <div className="card">
          <h3>About this project</h3>
          <p className="ws-body">{project.description}</p>
          <div className="skill-list">{project.tags.map((t) => <span className="skill" key={t}>{t}</span>)}</div>
          {project.repo && <p className="small" style={{ marginTop: 14 }}><a className="text-link" href={project.repo} target="_blank" rel="noreferrer">Repository</a></p>}
        </div>

        <div className="card">
          <div className="ws-row-between"><h3>Milestones</h3><span className="count">{project.milestones.filter((m) => m.done).length}/{project.milestones.length}</span></div>
          {project.milestones.length === 0 && <Empty>No milestones yet.</Empty>}
          <ul className="ws-list">
            {[...project.milestones].sort((a, b) => (a.due || '9').localeCompare(b.due || '9')).map((m) => (
              <li key={m.id} className={m.done ? 'done' : ''}>
                <label className="ws-check">
                  <input type="checkbox" checked={m.done} disabled={!lead} onChange={() => toggleMilestone(project.id, m.id, actor)} />
                  <span>{m.title}</span>
                </label>
                <span className="small muted">{m.due ? fmtDate(m.due) : ''}</span>
                {lead && <button type="button" className="icon-btn ws-x" aria-label={`Delete ${m.title}`} onClick={() => deleteMilestone(project.id, m.id, actor)}>×</button>}
              </li>
            ))}
          </ul>
          {lead && (
            <form className="ws-inline-form" onSubmit={submit}>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New milestone" aria-label="Milestone title" maxLength={80} />
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Milestone due date" />
              <button className="btn btn-ghost" disabled={title.trim().length < 3}>Add</button>
            </form>
          )}
        </div>

        <div className="card">
          <div className="ws-row-between"><h3>Latest activity</h3><button type="button" className="ws-linkbtn" onClick={() => onOpenTab('activity')}>See all →</button></div>
          {project.activity.length === 0 && <Empty>Nothing yet.</Empty>}
          <ul className="ws-feed">{project.activity.slice(0, 4).map((a) => <li key={a.id}><b>{a.actor}</b> {a.text} <span className="muted small">· {timeAgo(a.at)}</span></li>)}</ul>
        </div>
      </div>

      <aside className="ws-col">
        <div className="card">
          <h3>Progress</h3>
          <div className="ws-big">{progress}%</div>
          <ProgressBar value={progress} label="Overall progress" />
          <p className="small muted" style={{ marginTop: 10 }}>{counts.done} of {counts.total} tasks done{counts.blocked ? ` · ${counts.blocked} blocked` : ''}</p>
        </div>
        <div className="card">
          <h3>Project health</h3>
          <div className={`ws-health health-${health.tone}`}><b>{health.score}</b><span>{health.label}</span></div>
          {health.reasons.length > 0
            ? <ul className="ws-reasons">{health.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            : <p className="small muted">No risks detected. Keep going!</p>}
        </div>
        <div className="card">
          <h3>Leadership</h3>
          <p className="small muted">Project lead</p>
          <p><b>{project.members.find((m) => m.key === project.leadKey)?.name || '—'}</b></p>
          {lead ? (
            <label className="small" style={{ display: 'grid', gap: 6, marginTop: 14 }}>Project status
              <select value={project.status} onChange={(e) => updateProject(project.id, { status: e.target.value }, actor)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            </label>
          ) : <p className="small muted" style={{ marginTop: 10 }}>Only the project lead can change the status.</p>}
        </div>
      </aside>
    </div>
  );
}
