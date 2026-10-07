import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getUsers, errorMessage } from '../services/postService';
import useDebounce from '../hooks/useDebounce';
import UserCard from '../components/UserCard.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import AlertBanner from '../components/AlertBanner.jsx';

export default function UserDirectory() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [params] = useSearchParams();
  const urlQuery = params.get('q') || '';
  const [query, setQuery] = useState(urlQuery);
  useEffect(() => { setQuery(urlQuery); }, [urlQuery]);
  const debounced = useDebounce(query, 200);

  const load = useCallback(() => {
    setLoading(true); setError('');
    getUsers().then(setUsers).catch((e) => setError(errorMessage(e))).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const q = debounced.trim().toLowerCase();
  const filtered = users.filter((u) => u.name.toLowerCase().includes(q) || u.company.name.toLowerCase().includes(q));

  return (
    <section>
      <div className="page-head">
        <h1>Developers</h1>
        <input className="search" type="search" placeholder="Search by name or company" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search developers" />
      </div>
      {error && <AlertBanner key={error + Date.now()} message={error} onRetry={load} />}
      {loading ? <SkeletonLoader /> : (
        <>
          <div className="grid">{filtered.map((u) => <UserCard key={u.id} user={u} />)}</div>
          {!error && filtered.length === 0 && <p className="empty">No developer matches “{debounced}”. Try a different name or company.</p>}
        </>
      )}
    </section>
  );
}
