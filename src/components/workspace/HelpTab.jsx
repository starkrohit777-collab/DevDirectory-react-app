import { Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { timeAgo } from '../../utils/workspace.js';
import { Empty } from './Parts.jsx';

export default function HelpTab({ project }) {
  const { problems } = useWorkspace();
  const linked = problems.filter((q) => q.projectId === project.id);
  return (
    <div>
      <div className="ws-row-between ws-task-head">
        <p className="muted small">Real problems this team ran into, shared with the wider developer community.</p>
        <Link className="btn btn-primary" to={`/community/new?project=${project.id}`}>Ask the community</Link>
      </div>
      <div className="stack">
        {linked.map((q) => (
          <article key={q.id} className="card ws-problem-row">
            <div>
              <span className={`ws-badge ${q.status === 'Solved' ? 'health-good' : 'status-planning'}`}>{q.status === 'Solved' ? '✓ Solved' : 'Open'}</span>
              <h3><Link className="ws-title-link" to={`/community/${q.id}`}>{q.title}</Link></h3>
              <p className="small muted">{q.author} · {timeAgo(q.at)} · {q.answers.length} answer{q.answers.length === 1 ? '' : 's'}</p>
            </div>
          </article>
        ))}
        {linked.length === 0 && <Empty>No community questions linked to this project yet.</Empty>}
      </div>
    </div>
  );
}
