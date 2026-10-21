// Helpers shared by the Projects / Community features.

export const uid = (p = 'id') => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const STATUSES = ['Planning', 'Active', 'On hold', 'Completed'];
export const TASK_COLUMNS = [
  { key: 'todo', label: 'To do' },
  { key: 'doing', label: 'In progress' },
  { key: 'review', label: 'In review' },
  { key: 'done', label: 'Done' },
];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
export const THREAD_KINDS = ['Discussion', 'Question', 'Decision', 'Announcement'];

export const norm = (s) => (s || '').trim().toLowerCase();

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '—');

export const isOverdue = (task) => task.status !== 'done' && task.due && new Date(task.due).getTime() < new Date(new Date().toDateString()).getTime();

// A "person" in the app is identified by the logged-in name/email.
export const isSamePerson = (member, user) =>
  !!user && ((member.email && norm(member.email) === norm(user.email)) || norm(member.name) === norm(user.name));

export const getMember = (project, user) => project.members.find((m) => isSamePerson(m, user)) || null;
export const isLead = (project, user) => {
  if (!user) return false;
  if (project.ownerEmail && norm(project.ownerEmail) === norm(user.email)) return true;
  const lead = project.members.find((m) => m.key === project.leadKey);
  return !!lead && isSamePerson(lead, user);
};
export const isMember = (project, user) => isLead(project, user) || !!getMember(project, user);

export const progressOf = (project) => {
  const total = project.tasks.length;
  if (!total) return 0;
  return Math.round((project.tasks.filter((t) => t.status === 'done').length / total) * 100);
};

// Simple, explainable health score so a lead sees trouble early.
export function healthOf(project) {
  if (project.status === 'Completed') return { score: 100, label: 'Delivered', tone: 'good', reasons: [] };
  if (project.status === 'On hold') return { score: 50, label: 'Paused', tone: 'warn', reasons: ['Project is on hold'] };
  const reasons = [];
  let score = 100;
  const overdue = project.tasks.filter(isOverdue).length;
  const blocked = project.tasks.filter((t) => t.blocked && t.status !== 'done').length;
  const unassigned = project.tasks.filter((t) => !t.assignee && t.status !== 'done').length;
  const last = project.activity[0] ? Date.now() - new Date(project.activity[0].at).getTime() : Infinity;
  if (overdue) { score -= overdue * 12; reasons.push(`${overdue} overdue task${overdue > 1 ? 's' : ''}`); }
  if (blocked) { score -= blocked * 10; reasons.push(`${blocked} blocked task${blocked > 1 ? 's' : ''}`); }
  if (unassigned) { score -= unassigned * 4; reasons.push(`${unassigned} unassigned task${unassigned > 1 ? 's' : ''}`); }
  if (last > 7 * 864e5) { score -= 15; reasons.push('No activity in over a week'); }
  score = Math.max(5, Math.min(100, score));
  const label = score >= 75 ? 'On track' : score >= 45 ? 'At risk' : 'Needs attention';
  const tone = score >= 75 ? 'good' : score >= 45 ? 'warn' : 'bad';
  return { score, label, tone, reasons };
}
