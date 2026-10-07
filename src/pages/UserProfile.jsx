import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUser, getUserPosts, errorMessage } from '../services/postService';
import { Avatar } from '../components/UserCard.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import NotFound from './NotFound.jsx';

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

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
          <p className="muted">@{user.username} · {user.company.name}</p>
          <p className="small">{user.email} · {user.phone} · {user.website}</p>
          <p className="small muted">{user.address.street}, {user.address.city}</p>
        </div>
      </div>
      <h2>Writeups <span className="count">{posts.length}</span></h2>
      <div className="stack">
        {posts.map((p) => (
          <article key={p.id} className="card post">
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
