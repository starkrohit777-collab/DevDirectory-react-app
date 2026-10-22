import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { developers } from '../../data/developers.js';
import { timeAgo } from '../../utils/workspace.js';
import { MemberAvatar, Empty } from './Parts.jsx';

export default function TeamTab({ project, lead, member, user, actor }) {
  const { addMember, removeMember, setMemberRole, transferLead, requestJoin, resolveRequest } = useWorkspace();
  const [devId, setDevId] = useState('');
  const [role, setRole] = useState('Developer');
  const [message, setMessage] = useState('');

  const available = developers.filter((d) => !project.members.some((m) => m.devId === d.id));
  const pending = user && project.requests.some((r) => r.email === user.email);

  const add = (e) => {
    e.preventDefault();
    const d = developers.find((x) => x.id === Number(devId));
    if (!d) return;
    addMember(project.id, { key: `dev-${d.id}`, devId: d.id, name: d.name, email: d.email, role: role.trim() || 'Developer' }, actor);
    setDevId(''); setRole('Developer');
  };

  const join = (e) => {
    e.preventDefault();
    if (message.trim().length < 10) return;
    requestJoin(project.id, user, message.trim());
    setMessage('');
  };

  return (
    <div className="ws-two-col">
      <div className="ws-col">
        <div className="card">
          <div className="ws-row-between"><h3>Team <span className="count">{project.members.length}</span></h3></div>
          <ul className="ws-members">
            {project.members.map((m) => {
              const isLeadMember = m.key === project.leadKey;
              return (
                <li key={m.key}>
                  <MemberAvatar member={m} size={44} />
                  <div className="ws-member-info">
                    <b>{m.devId ? <Link to={`/users/${m.devId}`}>{m.name}</Link> : m.name}</b>
                    {lead && !isLeadMember
                      ? <input className="ws-role-input" defaultValue={m.role} aria-label={`Role of ${m.name}`} maxLength={40} onBlur={(e) => e.target.value.trim() && e.target.value.trim() !== m.role && setMemberRole(project.id, m.key, e.target.value.trim(), actor)} />
                      : <span className="small muted">{m.role}</span>}
                    <span className="small muted">{project.tasks.filter((t) => t.assignee === m.key && t.status !== 'done').length} open tasks</span>
                  </div>
                  {isLeadMember && <span className="ws-badge status-active">Lead</span>}
                  {lead && !isLeadMember && (
                    <div className="ws-actions">
                      <button type="button" className="btn btn-small btn-ghost" onClick={() => window.confirm(`Make ${m.name} the project lead? You will lose lead controls.`) && transferLead(project.id, m.key, actor)}>Make lead</button>
                      <button type="button" className="btn btn-small btn-ghost" onClick={() => window.confirm(`Remove ${m.name} from the team?`) && removeMember(project.id, m.key, actor)}>Remove</button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {lead && (
          <div className="card">
            <h3>Add a developer</h3>
            <p className="small muted">Pick someone from the directory and give them a role.</p>
            {available.length === 0 ? <Empty>Everyone in the directory is already on this team.</Empty> : (
              <form className="ws-inline-form" onSubmit={add}>
                <select value={devId} onChange={(e) => setDevId(e.target.value)} aria-label="Developer">
                  <option value="">Select developer</option>
                  {available.map((d) => <option key={d.id} value={d.id}>{d.name} — {d.role.split('·')[0].trim()}</option>)}
                </select>
                <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" aria-label="Role" maxLength={40} />
                <button className="btn btn-primary" disabled={!devId}>Add</button>
              </form>
            )}
          </div>
        )}
      </div>

      <aside className="ws-col">
        {lead && (
          <div className="card">
            <h3>Join requests <span className="count">{project.requests.length}</span></h3>
            {project.requests.length === 0 && <Empty>No pending requests.</Empty>}
            <ul className="ws-requests">
              {project.requests.map((r) => (
                <li key={r.key}>
                  <b>{r.name}</b> <span className="small muted">· {timeAgo(r.at)}</span>
                  <p className="small">{r.message}</p>
                  <div className="ws-actions">
                    <button type="button" className="btn btn-small btn-primary" onClick={() => resolveRequest(project.id, r, true, actor)}>Accept</button>
                    <button type="button" className="btn btn-small btn-ghost" onClick={() => resolveRequest(project.id, r, false, actor)}>Decline</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!member && (
          <div className="card">
            <h3>Want to contribute?</h3>
            {!user ? (
              <p className="small muted"><Link className="text-link" to="/login" state={{ from: { pathname: `/projects/${project.id}` } }}>Log in</Link> to ask the lead to let you join.</p>
            ) : pending ? (
              <p className="small muted">Your request is waiting for the project lead to respond.</p>
            ) : (
              <form className="form" onSubmit={join}>
                <label className="small">Tell the lead how you can help
                  <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={300} placeholder="Skills, availability, what you'd like to work on…" />
                </label>
                <button className="btn btn-primary" disabled={message.trim().length < 10}>Request to join</button>
              </form>
            )}
          </div>
        )}
        {member && !lead && <div className="card"><h3>You're on this team</h3><p className="small muted">Your role: {member.role}. Update your assigned tasks and join the discussion.</p></div>}
      </aside>
    </div>
  );
}
