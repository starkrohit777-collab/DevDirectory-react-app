import { Link } from 'react-router-dom';
import { Avatar } from '../UserCard.jsx';
import { developers } from '../../data/developers.js';
import { healthOf, progressOf } from '../../utils/workspace.js';

export const ProgressBar = ({ value, label }) => (
  <div className="ws-progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label || 'Progress'}>
    <span style={{ width: `${value}%` }} />
  </div>
);

export const StatusBadge = ({ status }) => (
  <span className={`ws-badge status-${status.toLowerCase().replace(/\s/g, '-')}`}>{status}</span>
);

export const HealthBadge = ({ project }) => {
  const h = healthOf(project);
  return <span className={`ws-badge health-${h.tone}`} title={h.reasons.join(', ') || 'No issues detected'}>● {h.label}</span>;
};

// Avatar for a team member: directory developers get their photo, other people get initials.
export function MemberAvatar({ member, size = 36 }) {
  const d = member.devId ? developers.find((x) => x.id === member.devId) : null;
  if (d) return <Avatar user={d} size={size} />;
  const hue = [...member.name].reduce((n, c) => n + c.charCodeAt(0), 0) % 360;
  const initials = member.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div className="avatar" role="img" aria-label={member.name} style={{ width: size, height: size, '--avatar-hue': hue, fontSize: size * 0.34 }}>
      {initials}
    </div>
  );
}

export function AvatarStack({ members, max = 4 }) {
  return (
    <div className="ws-stack" aria-label={`${members.length} team members`}>
      {members.slice(0, max).map((m) => <span key={m.key} title={m.name}><MemberAvatar member={m} size={30} /></span>)}
      {members.length > max && <span className="ws-more">+{members.length - max}</span>}
    </div>
  );
}

export function ProjectCard({ project }) {
  const lead = project.members.find((m) => m.key === project.leadKey);
  const progress = progressOf(project);
  const open = project.tasks.filter((t) => t.status !== 'done').length;
  return (
    <article className="card ws-project-card">
      <div className="ws-row-between">
        <StatusBadge status={project.status} />
        <HealthBadge project={project} />
      </div>
      <h3><Link to={`/projects/${project.id}`} className="ws-title-link">{project.name}</Link></h3>
      <p className="muted small">{project.tagline}</p>
      <div className="skill-list">{project.tags.slice(0, 3).map((t) => <span className="skill" key={t}>{t}</span>)}</div>
      <div className="ws-progress-wrap">
        <div className="ws-row-between small muted"><span>{progress}% complete</span><span>{open} open task{open === 1 ? '' : 's'}</span></div>
        <ProgressBar value={progress} label={`${project.name} progress`} />
      </div>
      <div className="ws-row-between ws-card-foot">
        <AvatarStack members={project.members} />
        <span className="small muted">Lead: {lead ? lead.name : '—'}</span>
      </div>
    </article>
  );
}

export const Empty = ({ children }) => <p className="ws-empty">{children}</p>;
