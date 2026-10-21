import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { timeAgo } from '../utils/workspace.js';
import NotFound from './NotFound.jsx';

export default function ProblemDetail() {
  const { id } = useParams();
  const { problems, projects, voteProblem, addAnswer, voteAnswer, acceptAnswer, linkProblem, deleteProblem } = useWorkspace();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const q = problems.find((p) => p.id === id);
  if (!q) return <NotFound message="That community question doesn't exist." />;

  const actor = user?.name || '';
  const mine = !!user && q.author === actor;
  const project = projects.find((p) => p.id === q.projectId);
  const answers = [...q.answers].sort((a, b) => Number(b.accepted) - Number(a.accepted) || b.votes.length - a.votes.length);
  const login = { from: { pathname: `/community/${q.id}` } };

  const submit = (e) => {
    e.preventDefault();
    if (text.trim().length < 15) return;
    addAnswer(q.id, text.trim(), actor);
    setText('');
  };

  return (
    <section className="ws-problem-page">
      <Link to="/community" className="back">← Community help</Link>
      <article className="card ws-question">
        <div className="ws-thread-meta">
          <span className={`ws-badge ${q.status === 'Solved' ? 'health-good' : 'status-planning'}`}>{q.status === 'Solved' ? '✓ Solved' : 'Open'}</span>
          <span className="small muted">Asked by {q.author} · {timeAgo(q.at)}</span>
        </div>
        <h1 className="ws-h1 ws-q-title">{q.title}</h1>
        <p className="ws-body">{q.body}</p>
        <div className="skill-list">{q.tags.map((t) => <span className="skill" key={t}>{t}</span>)}</div>
        <div className="ws-thread-foot">
          <button type="button" className={`ws-vote${user && q.upvotes.includes(actor) ? ' on' : ''}`} disabled={!user} onClick={() => voteProblem(q.id, actor)} title={user ? 'This problem matters' : 'Log in to vote'}>▲ {q.upvotes.length} · I have this problem too</button>
          {project && <Link className="text-link" to={`/projects/${project.id}`}>Linked project: {project.name} ↗</Link>}
          {mine && (
            <>
              <select className="ws-mini" value={q.projectId} onChange={(e) => linkProblem(q.id, e.target.value)} aria-label="Link to project">
                <option value="">No linked project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button type="button" className="ws-linkbtn" onClick={() => { if (window.confirm('Delete this question?')) { deleteProblem(q.id); navigate('/community'); } }}>Delete</button>
            </>
          )}
        </div>
      </article>

      <h2 className="ws-h2">{q.answers.length} answer{q.answers.length === 1 ? '' : 's'}</h2>
      <div className="stack">
        {answers.map((a) => (
          <article key={a.id} className={`card ws-answer${a.accepted ? ' accepted' : ''}`}>
            {a.accepted && <span className="ws-badge health-good">✓ Accepted solution</span>}
            <p className="ws-body">{a.body}</p>
            <div className="ws-thread-foot">
              <span className="small muted">{a.author} · {timeAgo(a.at)}</span>
              <button type="button" className={`ws-vote${user && a.votes.includes(actor) ? ' on' : ''}`} disabled={!user} onClick={() => voteAnswer(q.id, a.id, actor)}>▲ {a.votes.length} helpful</button>
              {mine && <button type="button" className="btn btn-small btn-ghost" onClick={() => acceptAnswer(q.id, a.id)}>{a.accepted ? 'Unmark solution' : 'Mark as solution'}</button>}
            </div>
          </article>
        ))}
      </div>

      {user ? (
        <form className="card form ws-answer-form" onSubmit={submit}>
          <label>Your answer<textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} maxLength={1200} placeholder="Share what worked for you and why." /></label>
          <button className="btn btn-primary" disabled={text.trim().length < 15}>Post answer</button>
        </form>
      ) : <p className="data-note ws-note"><Link className="text-link" to="/login" state={login}>Log in</Link> to answer or vote.</p>}
    </section>
  );
}
