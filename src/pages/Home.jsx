import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUsers } from '../services/postService';

export default function Home() {
  const [users, setUsers] = useState([]);
  useEffect(() => { getUsers().then(setUsers).catch(() => {}); }, []);
  const companies = new Set(users.map((u) => u.company.name)).size;
  const cities = new Set(users.map((u) => u.address.city)).size;

  return (
    <section className="hero">
      <h1>Find the people<br />behind the code.</h1>
      <p className="lead">Search your engineering org, read what each developer has written, and publish team bulletins without leaving the page.</p>
      <div className="row">
        <Link to="/users" className="btn btn-primary btn-lg">Browse developers</Link>
        <Link to="/add-post" className="btn btn-ghost btn-lg">Write a post</Link>
      </div>
      <div className="stats">
        <div><b>{users.length || '–'}</b><span>developers</span></div>
        <div><b>{companies || '–'}</b><span>companies</span></div>
        <div><b>{cities || '–'}</b><span>cities</span></div>
      </div>
    </section>
  );
}
