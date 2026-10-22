import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useDebounce from '../hooks/useDebounce';
import { ProjectCard, Empty } from '../components/workspace/Parts.jsx';
import { STATUSES, isMember } from '../utils/workspace.js';

export default function Projects() {
  const { projects, problems, resetDemo } = useWorkspace();
  const { user, isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [mineOnly, setMineOnly] = useState(false);
  const q = useDebounce(query, 200).trim().toLowerCase();

  const filtered = useMemo(() => projects.filter((p) => {
    if (status !== 'All' && p.status !== status) return false;
    if (mineOnly && !isMember(p, user)) return false;
    if (!q) return true;
    return [p.name, p.tagline, ...(p.tags || []), ...(p.members || []).map((m) => m.name)].some((s) =>
      s?.toLowerCase().includes(q)
    );
  }), [projects, status, mineOnly, q, user]);

  const totalTasks = projects.reduce((n, p) => n + (p.tasks?.length || 0), 0);
  const doneTasks = projects.reduce((n, p) => n + (p.tasks?.filter((t) => t.status === 'done').length || 0), 0);
  const people = new Set(projects.flatMap((p) => (p.members || []).map((m) => m.name))).size;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Projects</h1>
          <p className="muted directory-subtitle">
            Every project has a lead, a team, a task board and a discussion space. Track progress at a glance.
          </p>
        </div>
        <Link to="/projects/new" className="btn btn-primary btn-lg">+ New project</Link>
      </div>

      <div className="ws-stats">
        <div><b>{projects.length}</b><span>tracked projects</span></div>
        <div><b>{people}</b><span>collaborators</span></div>
        <div><b>{doneTasks}/{totalTasks}</b><span>tasks completed</span></div>
        <div><b>{problems.filter((x) => x.status === 'Solved').length}</b><span>community problems solved</span></div>
      </div>

      <div className="ws-toolbar">
        <input
          className="search"
          type="search"
          placeholder="Search projects, tags or people…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search projects"
        />
        <div className="ws-chips" role="group" aria-label="Filter by status">
          {['All', ...STATUSES].map((s) => (
            <button
              key={s}
              type="button"
              className={`ws-chip${status === s ? ' on' : ''}`}
              onClick={() => setStatus(s)}
              aria-pressed={status === s}
            >
              {s}
            </button>
          ))}
          {isAuthenticated && (
            <button
              type="button"
              className={`ws-chip${mineOnly ? ' on' : ''}`}
              onClick={() => setMineOnly(!mineOnly)}
              aria-pressed={mineOnly}
            >
              My projects
            </button>
          )}
        </div>
      </div>

      <p className="result-count">{filtered.length} project{filtered.length === 1 ? '' : 's'} found</p>
      <div className="grid">
        {filtered.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
      {filtered.length === 0 && <Empty>No projects match your filters.</Empty>}

      <p className="data-note ws-note">
        All projects, tasks, and discussions are stored and tracked in the backend database.{' '}
        <button
          type="button"
          className="ws-linkbtn"
          onClick={async () => {
            if (window.confirm('Reset all projects and community data to the demo seed content?')) {
              await resetDemo();
            }
          }}
        >
          Reset demo data
        </button>
      </p>
    </section>
  );
}
