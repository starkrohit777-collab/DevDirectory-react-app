import { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { PRIORITIES, TASK_COLUMNS, fmtDate, isOverdue, isSamePerson } from '../../utils/workspace.js';
import { MemberAvatar } from './Parts.jsx';

const blank = { title: '', desc: '', assignee: '', priority: 'Medium', due: '' };

export default function TasksTab({ project, lead, member, user, actor }) {
  const { addTask, updateTask, deleteTask } = useWorkspace();
  const [form, setForm] = useState(blank);
  const [showForm, setShowForm] = useState(false);
  const [mine, setMine] = useState(false);
  const [blockerFor, setBlockerFor] = useState(null);
  const [blockerText, setBlockerText] = useState('');

  const memberByKey = (key) => project.members.find((m) => m.key === key);
  const canEdit = (t) => lead || (member && t.assignee && isSamePerson(memberByKey(t.assignee) || {}, user));
  const visible = project.tasks.filter((t) => !mine || (t.assignee && isSamePerson(memberByKey(t.assignee) || {}, user)));

  const submit = (e) => {
    e.preventDefault();
    if (form.title.trim().length < 3) return;
    addTask(project.id, { ...form, title: form.title.trim(), desc: form.desc.trim(), assignee: form.assignee || null }, actor);
    setForm(blank); setShowForm(false);
  };

  const move = (t, status) => updateTask(project.id, t.id, { status, ...(status === 'done' ? { blocked: false, blocker: '' } : {}) }, actor, `moved “${t.title}” to ${TASK_COLUMNS.find((c) => c.key === status).label}`);

  const saveBlocker = (t) => {
    updateTask(project.id, t.id, { blocked: true, blocker: blockerText.trim() || 'Needs help' }, actor, `flagged “${t.title}” as blocked`);
    setBlockerFor(null); setBlockerText('');
  };

  return (
    <div>
      <div className="ws-row-between ws-task-head">
        <div className="ws-chips">
          <button type="button" className={`ws-chip${!mine ? ' on' : ''}`} onClick={() => setMine(false)}>All tasks</button>
          {member && <button type="button" className={`ws-chip${mine ? ' on' : ''}`} onClick={() => setMine(true)}>My tasks</button>}
        </div>
        {lead && <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Close' : '+ New task'}</button>}
      </div>

      {lead && showForm && (
        <form className="card form ws-task-form" onSubmit={submit}>
          <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={90} placeholder="What needs to be done?" /></label>
          <label>Details <span className="hint-inline">(optional)</span><textarea rows={2} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} maxLength={300} /></label>
          <div className="ws-three">
            <label>Assign to
              <select value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })}>
                <option value="">Unassigned</option>
                {project.members.map((m) => <option key={m.key} value={m.key}>{m.name}</option>)}
              </select>
            </label>
            <label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select></label>
            <label>Due date<input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} /></label>
          </div>
          <button className="btn btn-primary" disabled={form.title.trim().length < 3}>Create task</button>
        </form>
      )}

      <div className="ws-board">
        {TASK_COLUMNS.map((col) => {
          const items = visible.filter((t) => t.status === col.key);
          return (
            <section key={col.key} className="ws-column" aria-label={col.label}>
              <h4>{col.label} <span className="count">{items.length}</span></h4>
              {items.length === 0 && <p className="small muted ws-col-empty">Nothing here</p>}
              {items.map((t) => {
                const a = memberByKey(t.assignee);
                const editable = canEdit(t);
                return (
                  <article key={t.id} className={`ws-task prio-${t.priority.toLowerCase()}${t.blocked ? ' blocked' : ''}`}>
                    <div className="ws-row-between"><span className={`ws-prio prio-${t.priority.toLowerCase()}`}>{t.priority}</span>{lead && <button type="button" className="icon-btn ws-x" aria-label={`Delete ${t.title}`} onClick={() => window.confirm('Delete this task?') && deleteTask(project.id, t.id, actor)}>×</button>}</div>
                    <h5>{t.title}</h5>
                    {t.desc && <p className="small muted">{t.desc}</p>}
                    {t.blocked && <p className="ws-blocker">⛔ {t.blocker}</p>}
                    <div className="ws-row-between small muted">
                      <span className="ws-assignee">{a ? <><MemberAvatar member={a} size={22} /> {a.name.split(' ')[0]}</> : 'Unassigned'}</span>
                      <span className={isOverdue(t) ? 'ws-overdue' : ''}>{t.due ? `${isOverdue(t) ? 'Overdue · ' : ''}${fmtDate(t.due)}` : ''}</span>
                    </div>
                    {lead && (
                      <select className="ws-mini" value={t.assignee || ''} aria-label="Assignee" onChange={(e) => updateTask(project.id, t.id, { assignee: e.target.value || null }, actor, `assigned “${t.title}” to ${memberByKey(e.target.value)?.name || 'nobody'}`)}>
                        <option value="">Unassigned</option>
                        {project.members.map((m) => <option key={m.key} value={m.key}>{m.name}</option>)}
                      </select>
                    )}
                    {editable && (
                      <div className="ws-move">
                        <select className="ws-mini" value={t.status} aria-label="Move task" onChange={(e) => move(t, e.target.value)}>
                          {TASK_COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                        </select>
                        {t.status !== 'done' && (t.blocked
                          ? <button type="button" className="btn btn-small btn-ghost" onClick={() => updateTask(project.id, t.id, { blocked: false, blocker: '' }, actor, `unblocked “${t.title}”`)}>Unblock</button>
                          : <button type="button" className="btn btn-small btn-ghost" onClick={() => { setBlockerFor(t.id); setBlockerText(''); }}>Blocked?</button>)}
                      </div>
                    )}
                    {blockerFor === t.id && (
                      <div className="ws-blocker-form">
                        <input value={blockerText} onChange={(e) => setBlockerText(e.target.value)} placeholder="What is blocking you?" maxLength={120} aria-label="Blocker reason" autoFocus />
                        <button type="button" className="btn btn-small btn-primary" onClick={() => saveBlocker(t)}>Flag</button>
                      </div>
                    )}
                  </article>
                );
              })}
            </section>
          );
        })}
      </div>
    </div>
  );
}
