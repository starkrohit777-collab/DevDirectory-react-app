import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUser, getUserPosts, errorMessage } from '../services/postService';
import { Avatar } from '../components/UserCard.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import NotFound from './NotFound.jsx';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { StatusBadge } from '../components/workspace/Parts.jsx';

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const { projects: teamProjects } = useWorkspace();

  const load = useCallback(() => {
    setLoading(true); setError(''); setNotFound(false);
    Promise.all([getUser(id), getUserPosts(id)])
      .then(([u, p]) => { setUser(u); setPosts(p); })
      .catch((e) => (e.response?.status === 404 ? setNotFound(true) : setError(errorMessage(e))))
      .finally(() => setLoading(false));
  }, [id]);
  useEffect(() => { load(); }, [load]);

  if (notFound) return <NotFound message={`No developer with id “${id}” exists.`} />;
  if (loading) return <SkeletonLoader count={3} variant="row" />;
  if (error) return <AlertBanner key={error + Date.now()} message={error} onRetry={load} />;

  return (
    <section>
      <Link to="/users" className="back">← All developers</Link>
      <div className="profile">
        <Avatar user={user} size={88} />
        <div>
          <h1>{user.name}</h1>
          <p className="muted">@{user.username} · {user.role}</p>
          <p className="profile-bio">{user.bio}</p><div className="profile-actions"><a className="btn btn-primary" href={user.github} target="_blank" rel="noreferrer">GitHub profile ↗</a><a className="btn btn-ghost" href={user.website} target="_blank" rel="noreferrer">Personal website ↗</a></div>
          <p className="small muted">⌖ {user.location} · {user.company.name}</p>
        </div>
      </div>
      <h2>Skills & expertise</h2><div className="skill-list profile-skills">{user.skills.map(skill => <span className="skill" key={skill}>{skill}</span>)}</div><div className="section-heading profile-project-heading"><div><span className="eyebrow">SELECTED WORK</span><h2>Projects & contributions <span className="count">{posts.length}</span></h2></div></div>
      <div className="stack">
        {posts.map((p) => (
          <article key={p.id} className="card post">
            <div className="project-title-row"><h3>{p.title}</h3><a className="project-link" href={p.url} target="_blank" rel="noreferrer" aria-label={`Open ${p.title}`}>↗</a></div>
            <p>{p.body}</p>
          </article>
        ))}
      </div>
      {(() => {
        const mine = teamProjects.filter((p) => p.members.some((m) => m.devId === user.id));
        if (!mine.length) return null;
        return (
          <div className="ws-profile-projects">
            <div className="section-heading"><div><span className="eyebrow">TEAM WORKSPACES</span><h2>Leading & collaborating <span className="count">{mine.length}</span></h2></div></div>
            <div className="stack">
              {mine.map((p) => (
                <article key={p.id} className="card ws-mini-project">
                  <div><h3><Link to={`/projects/${p.id}`}>{p.name}</Link></h3><p className="small muted">{p.members.find((m) => m.devId === user.id)?.role} · {p.members.length} developers</p></div>
                  <div className="row"><StatusBadge status={p.status} />{p.leadKey === `dev-${user.id}` && <span className="ws-badge status-active">Project lead</span>}</div>
                </article>
              ))}
            </div>
          </div>
        );
      })()}
    </section>
  );
}
