import { timeAgo } from '../../utils/workspace.js';
import { Empty } from './Parts.jsx';

export default function ActivityTab({ project }) {
  return (
    <div className="card">
      <h3>Work tracking timeline</h3>
      <p className="small muted">Every task move, decision and team change is logged automatically.</p>
      {project.activity.length === 0 && <Empty>No activity yet.</Empty>}
      <ol className="ws-timeline">
        {project.activity.map((a) => (
          <li key={a.id}><span className="ws-dot" /><div><p><b>{a.actor}</b> {a.text}</p><span className="small muted">{timeAgo(a.at)} · {new Date(a.at).toLocaleString()}</span></div></li>
        ))}
      </ol>
    </div>
  );
}
