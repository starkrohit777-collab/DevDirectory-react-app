import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import useDebounce from '../hooks/useDebounce';
import { timeAgo } from '../utils/workspace.js';
import { Empty } from '../components/workspace/Parts.jsx';

export default function Community() {
  const { problems, projects } = useWorkspace();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState('new');
  const q = useDebounce(query, 200).trim().toLowerCase();

  const tags = useMemo(() => [...new Set(problems.flatMap((p) => p.tags))].sort(), [problems]);
  const list = useMemo(() => problems
    .filter((p) => (status === 'All' || p.status === status) && (!tag || p.tags.includes(tag)) && (!q || p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))))
    .sort((a, b) => (sort === 'top' ? b.upvotes.length - a.upvotes.length : sort === 'unanswered' ? a.answers.length - b.answers.length || new Date(b.at) - new Date(a.at) : new Date(b.at) - new Date(a.at))),
  [problems, status, tag, sort, q]);

  return (
    <section>
      <div className="page-head">
        <div>
          <span className="eyebrow">REAL PROBLEMS · REAL ANSWERS</span>
          <h1>Community help</h1>
          <p className="muted directory-subtitle">Burnout, legacy code, slow reviews, career doubts — ask the problems developers actually face and learn from people who solved them.</p>
        </div>
        <Link to="/community/new" className="btn btn-primary btn-lg">+ Ask a question</Link>
      </div>

      <div className="ws-toolbar">
        <input className="search" type="search" placeholder="Search problems, topics or tags…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search community problems" />
        <div className="ws-chips" role="group" aria-label="Filter by status">
          {['All', 'Open', 'Solved'].map((s) => <button key={s} type="button" className={`ws-chip${status === s ? ' on' : ''}`} aria-pressed={status === s} onClick={() => setStatus(s)}>{s}</button>)}
          <select className="ws-sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort problems">
            <option value="new">Newest</option><option value="top">Most upvoted</option><option value="unanswered">Needs answers</option>
          </select>
        </div>
      </div>
      <div className="ws-chips ws-tagrow" aria-label="Filter by topic">
        {tags.map((t) => <button key={t} type="button" className={`ws-chip small-chip${tag === t ? ' on' : ''}`} aria-pressed={tag === t} onClick={() => setTag(tag === t ? '' : t)}>#{t}</button>)}
      </div>

      <p className="result-count">{list.length} problem{list.length === 1 ? '' : 's'}</p>
      <div className="stack">
        {list.map((p) => {
          const project = projects.find((x) => x.id === p.projectId);
          return (
            <article key={p.id} className="card ws-problem">
              <div className="ws-score"><b>{p.upvotes.length}</b><span>votes</span></div>
              <div className={`ws-score ${p.status === 'Solved' ? 'solved' : ''}`}><b>{p.answers.length}</b><span>answers</span></div>
              <div className="ws-problem-body">
                <h3><Link to={`/community/${p.id}`} className="ws-title-link">{p.title}</Link></h3>
                <p className="small muted ws-clamp">{p.body}</p>
                <div className="skill-list">
                  {p.status === 'Solved' && <span className="ws-badge health-good">✓ Solved</span>}
                  {p.tags.map((t) => <span className="skill" key={t}>{t}</span>)}
                  {project && <Link className="skill ws-proj-tag" to={`/projects/${project.id}`}>↗ {project.name}</Link>}
                </div>
                <p className="small muted">{p.author} · {timeAgo(p.at)}</p>
              </div>
            </article>
          );
        })}
        {list.length === 0 && <Empty>No problems match. Be the first to ask one.</Empty>}
      </div>
    </section>
  );
}
