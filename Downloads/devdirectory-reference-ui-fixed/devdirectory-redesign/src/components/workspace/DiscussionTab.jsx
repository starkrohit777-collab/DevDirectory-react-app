import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { THREAD_KINDS, timeAgo } from '../../utils/workspace.js';
import { Empty } from './Parts.jsx';

function Thread({ project, thread, lead, member, user, actor }) {
  const { replyThread, upvoteThread, pinThread, deleteThread } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState('');
  const voted = user && thread.upvotes.includes(actor);
  const canDelete = lead || (user && thread.author === actor);

  const send = (e) => {
    e.preventDefault();
    if (reply.trim().length < 2) return;
    replyThread(project.id, thread.id, reply.trim(), actor, thread.title);
    setReply('');
  };

  return (
    <article className={`card ws-thread${thread.pinned ? ' pinned' : ''}`}>
      <div className="ws-row-between">
        <div className="ws-thread-meta">
          <span className={`ws-badge kind-${thread.kind.toLowerCase()}`}>{thread.kind}</span>
          {thread.pinned && <span className="ws-badge status-planning">📌 Pinned</span>}
          <span className="small muted">{thread.author} · {timeAgo(thread.at)}</span>
        </div>
        <div className="ws-actions">
          {lead && <button type="button" className="btn btn-small btn-ghost" onClick={() => pinThread(project.id, thread.id, actor)}>{thread.pinned ? 'Unpin' : 'Pin'}</button>}
          {canDelete && <button type="button" className="btn btn-small btn-ghost" onClick={() => window.confirm('Delete this thread and its replies?') && deleteThread(project.id, thread.id, actor)}>Delete</button>}
        </div>
      </div>
      <h3>{thread.title}</h3>
      <p className="ws-body">{thread.body}</p>
      <div className="ws-thread-foot">
        <button type="button" className={`ws-vote${voted ? ' on' : ''}`} disabled={!user} aria-pressed={!!voted} onClick={() => upvoteThread(project.id, thread.id, actor)} title={user ? 'Upvote' : 'Log in to vote'}>▲ {thread.upvotes.length}</button>
        <button type="button" className="ws-linkbtn" onClick={() => setOpen(!open)}>{open ? 'Hide replies' : `${thread.replies.length} repl${thread.replies.length === 1 ? 'y' : 'ies'}`}</button>
      </div>
      {open && (
        <div className="ws-replies">
          {thread.replies.map((r) => (
            <div key={r.id} className="ws-reply"><p className="small"><b>{r.author}</b> <span className="muted">· {timeAgo(r.at)}</span></p><p>{r.body}</p></div>
          ))}
          {member ? (
            <form className="ws-inline-form" onSubmit={send}>
              <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" maxLength={400} aria-label="Reply" />
              <button className="btn btn-primary" disabled={reply.trim().length < 2}>Reply</button>
            </form>
          ) : <p className="small muted">Only team members can reply.</p>}
        </div>
      )}
    </article>
  );
}

export default function DiscussionTab({ project, lead, member, user, actor }) {
  const { addThread } = useWorkspace();
  const [kind, setKind] = useState('Discussion');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [show, setShow] = useState(false);

  const threads = [...project.threads].sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.at) - new Date(a.at));
  const valid = title.trim().length >= 5 && body.trim().length >= 10;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    addThread(project.id, { kind, title: title.trim(), body: body.trim() }, actor);
    setTitle(''); setBody(''); setKind('Discussion'); setShow(false);
  };

  return (
    <div>
      <div className="ws-row-between ws-task-head">
        <p className="muted small">Decisions, questions and announcements live here so nothing is lost in chat.</p>
        {member
          ? <button type="button" className="btn btn-primary" onClick={() => setShow(!show)}>{show ? 'Close' : '+ New thread'}</button>
          : <span className="small muted">{user ? 'Join the team to post.' : <><Link className="text-link" to="/login" state={{ from: { pathname: `/projects/${project.id}` } }}>Log in</Link> to take part.</>}</span>}
      </div>
      {member && show && (
        <form className="card form ws-task-form" onSubmit={submit}>
          <label>Type<select value={kind} onChange={(e) => setKind(e.target.value)}>{THREAD_KINDS.filter((k) => k !== 'Announcement' || lead).map((k) => <option key={k}>{k}</option>)}</select></label>
          <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="Summarise the topic" /></label>
          <label>Message<textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} maxLength={800} placeholder="Add context, options and what you need from the team" /></label>
          <button className="btn btn-primary" disabled={!valid}>Post thread</button>
        </form>
      )}
      <div className="stack">
        {threads.map((t) => <Thread key={t.id} project={project} thread={t} lead={lead} member={member} user={user} actor={actor} />)}
        {threads.length === 0 && <Empty>No discussions yet. Start the first one.</Empty>}
      </div>
    </div>
  );
}
