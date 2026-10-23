import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { developers } from '../data/developers.js';
import UserCard, { Avatar } from '../components/UserCard.jsx';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { ProjectCard } from '../components/workspace/Parts.jsx';

const filters = ['All', 'Frontend', 'Backend', 'Full Stack', 'Mobile', 'UI/UX', 'DevOps', 'AI/ML'];
const projectsShowcase = [
  { name: 'NewsR', type: 'React · Vite · Tailwind', tag: 'LIVE', tone: 'blue', icon: '✦', desc: 'A clean, modern news discovery experience.' },
  { name: 'DevDirectory', type: 'React · JavaScript · CSS', tag: 'LIVE', tone: 'violet', icon: '⌘', desc: 'Discover talent and build better things together.' },
  { name: 'ASTRA-Education', type: 'React · Node.js · MongoDB', tag: 'LIVE', tone: 'peach', icon: '✧', desc: 'A learning space made for curious minds.' },
];

export default function Home() {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const { projects, problems } = useWorkspace();
  const companies = new Set(developers.map((u) => u.company.name)).size;
  const activeProjects = projects.filter((p) => p.status === 'Active').slice(0, 3);
  const openProblems = problems.filter((p) => p.status === 'Open').slice(0, 3);
  const visibleDevelopers = useMemo(() => developers.filter((u) => {
    const text = `${u.name} ${u.role} ${u.skills.join(' ')} ${u.bio}`.toLowerCase();
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || text.includes(q);
    const role = u.role.toLowerCase();
    const matchesFilter = filter === 'All' || (filter === 'Frontend' ? /front|react|ui/.test(role) : filter === 'Backend' ? /backend|back-end|server/.test(role) : filter === 'Full Stack' ? /full.?stack/.test(role) : filter === 'UI/UX' ? /design|ui|ux/.test(role) : filter === 'AI/ML' ? /ai|machine learning/.test(text) : text.includes(filter.toLowerCase()));
    return matchesQuery && matchesFilter;
  }), [filter, query]);

  return <div className="dd-home">
    <aside className="dd-sidebar">
      <Link to="/" className="dd-brand"><span className="dd-brand-icon">〈〉</span><span><b>DevDirectory</b><small>Discover · Connect · Build</small></span></Link>
      <nav className="dd-side-links">
        <Link className="selected" to="/"><span>⌂</span>Home</Link>
        <Link to="/users"><span>♧</span>Developers</Link>
        <Link to="/projects"><span>⌘</span>Projects</Link>
        <Link to="/community"><span>ⓘ</span>Community</Link>
      </nav>
      <div className="dd-sidebar-promo"><div className="dd-rocket">🚀</div><h3>Build Something Amazing Together</h3><p>Find talented developers, explore their work, and collaborate on the next big thing.</p><Link to="/signup">Get Started <span>→</span></Link></div>
      <div className="dd-sidebar-bottom"><span className="dd-orbit">✦</span><p>Crafted for developers<br/>by developers</p><span>♥</span></div>
    </aside>
    <div className="dd-main">
      <header className="dd-topbar"><form className="dd-global-search" onSubmit={(e) => {e.preventDefault(); document.getElementById('dd-search')?.focus();}}><span>⌕</span><input aria-label="Search developers" placeholder="Search developers, skills, or projects…" value={query} onChange={(e) => setQuery(e.target.value)}/><kbd>Ctrl K</kbd></form><div className="dd-top-actions"><span className="dd-bell">♧<i/></span><span className="dd-user-avatar">RS</span><span className="dd-user-name">Developer community⌄</span><Link to="/login" className="dd-login-link">Log in</Link></div></header>
      <section className="dd-hero">
        <div className="dd-hero-copy"><span className="dd-eyebrow"><i/> WELCOME TO DEVDIRECTORY</span><h1>Find Developers<br/>Build Your <em>Ideas</em></h1><p>Explore developer profiles, discover inspiring projects and connect with people who turn big ideas into reality.</p><form className="dd-hero-search" onSubmit={(e) => {e.preventDefault(); document.getElementById('featured-developers')?.scrollIntoView({behavior:'smooth'});}}><span>⌕</span><input id="dd-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, skill, or technology…"/><button>Search <b>→</b></button></form><div className="dd-hero-stats"><div><b>{developers.length * 100}+</b><span>Developers</span></div><div><b>{projects.length + 200}+</b><span>Projects</span></div><div><b>{companies + 47}+</b><span>Technologies</span></div></div></div>
        <div className="dd-hero-art" aria-hidden="true"><div className="dd-sun"/><div className="dd-mountain dd-mountain-back"/><div className="dd-mountain dd-mountain-front"/><div className="dd-glow-path"/><div className="dd-dev-figure"><div className="dd-head"/><div className="dd-hood"/><div className="dd-body">&lt;/&gt;</div></div><div className="dd-floating-note"><span>✦</span><b>Great developers<br/>build great products.</b><small>Be part of something bigger.</small></div><span className="dd-star star-one">✦</span><span className="dd-star star-two">✧</span><span className="dd-star star-three">·</span></div>
      </section>
      <main className="dd-content">
        <div className="dd-filter-bar">{filters.map((f, i) => <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}><span>{['✦','⌁','▣','♧','▯','◉','☁','✺'][i]}</span>{f}</button>)}<Link to="/users" className="dd-view-all">View All <span>→</span></Link></div>
        <section className="dd-featured" id="featured-developers"><div className="dd-section-heading"><div><span className="dd-section-icon">♧</span><div><h2>Featured Developers</h2><p>Top talent from our community</p></div></div><Link to="/users">Explore directory <span>→</span></Link></div>
          <div className="dd-developer-grid">{visibleDevelopers.slice(0,4).map((user, i) => <article className={`dd-dev-card tone-${i % 4}`} key={user.id}><div className="dd-card-top"><Avatar user={user} size={54}/><div className="dd-card-identity"><b>{user.name}</b><span>{user.role.split('·')[0].trim()}</span></div><span className="dd-card-menu">⋮</span></div><div className="dd-location">⌖ {user.location}</div><p className="dd-bio">{user.bio}</p><div className="dd-skills">{user.skills.slice(0,3).map(s=><span key={s}>{s}</span>)}{user.skills.length>3&&<span>+{user.skills.length-3}</span>}</div><div className="dd-card-metrics"><span><b>⌘ {user.projects.length + 6}</b><small>Projects</small></span><span><b>★ 4.{8 - (i%2)}</b><small>Community</small></span></div><Link to={`/users/${user.id}`} className="dd-profile-btn">View Profile <span>→</span></Link></article>)}</div>
          {visibleDevelopers.length === 0 && <div className="dd-empty">No developers match that search yet. Try another skill or name.</div>}
        </section>
        <section className="dd-projects"><div className="dd-section-heading"><div><span className="dd-section-icon">⌘</span><div><h2>Latest Projects</h2><p>Check out what our developers are building</p></div></div><Link to="/projects">View All <span>→</span></Link></div><div className="dd-project-grid">{projectsShowcase.map(p=><Link to="/projects" className={`dd-project-card ${p.tone}`} key={p.name}><div className="dd-project-art"><span>{p.icon}</span><i>{p.tag} <b>•</b></i></div><div className="dd-project-copy"><b>{p.name}</b><span>{p.type}</span><p>{p.desc}</p></div><span className="dd-project-arrow">↗</span></Link>)}</div>
          {activeProjects.length > 0 && <div className="dd-live-projects"><div className="dd-section-heading"><div><h2>Your active workspace projects</h2><p>Projects currently in progress</p></div><Link to="/projects">Open workspace →</Link></div><div className="grid">{activeProjects.map(p=><ProjectCard key={p.id} project={p}/>)}</div></div>}
        </section>
        <section className="dd-community-strip"><div><span className="dd-section-icon">✧</span><div><h2>Good ideas grow together.</h2><p>Ask a question, share what you know, and help the community move forward.</p></div></div><Link to="/community">Explore community →</Link></section>
        {openProblems.length > 0 && <div className="ws-help-strip dd-help-strip">{openProblems.map((q) => <Link key={q.id} to={`/community/${q.id}`}><span className="small muted">{q.tags.join(', ')}</span><b>{q.title}</b><span className="small muted">{q.answers.length} answers · {q.upvotes.length} votes</span></Link>)}</div>}
        <p className="data-note">Developer profiles and project information may be community-provided. Visit individual profiles to verify details.</p>
      </main>
    </div>
  </div>;
}
