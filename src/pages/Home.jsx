import { Link } from 'react-router-dom';
import { developers } from '../data/developers.js';
import UserCard from '../components/UserCard.jsx';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { ProjectCard } from '../components/workspace/Parts.jsx';

export default function Home() {
  const companies = new Set(developers.map((u) => u.company.name)).size;
  const { projects, problems } = useWorkspace();
  const activeProjects = projects.filter((p) => p.status === 'Active').slice(0, 3);
  const openProblems = problems.filter((p) => p.status === 'Open').slice(0, 3);
  return (
    <div className="home-page">
      <section className="hero hero-panel">
        <div className="hero-copy">
          <span className="eyebrow"><span className="live-dot" /> THE DEVELOPER DIRECTORY</span>
          <h1>Good people.<br /><span>Great things</span><br />built on the web.</h1>
          <p className="lead">Explore the people behind the pull requests. Discover developer profiles, skills, open-source work, and the projects shaping the internet.</p>
          <div className="row">
            <Link to="/users" className="btn btn-primary btn-lg">Explore developers <span>↗</span></Link>
            <a href="#featured" className="btn btn-ghost btn-lg">Meet the community</a>
          </div>
          <div className="stats">
            <div><b>{developers.length.toString().padStart(2,'0')}</b><span>curated profiles</span></div>
            <div><b>{companies.toString().padStart(2,'0')}</b><span>teams & communities</span></div>
            <div><b>{developers.reduce((n,u)=>n+u.projects.length,0).toString().padStart(2,'0')}</b><span>featured projects</span></div>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
          <div className="floating-chip chip-top">{"< build />"}</div>
          <div className="hero-glass"><span className="glass-icon">✳</span><span className="glass-label">CREATORS<br/>OF THE WEB</span><strong>Ideas into<br/>impact.</strong><div className="mini-avatars">{developers.slice(0,4).map(u=><span key={u.id} title={u.name}><img src={u.avatar || `https://github.com/${encodeURIComponent(u.username)}.png?size=96`} alt={u.name} loading="lazy" onError={(e)=>{e.currentTarget.style.display='none';e.currentTarget.parentElement.textContent=u.name.split(' ').map(n=>n[0]).slice(0,2).join('');}} /></span>)}</div></div>
          <div className="floating-chip chip-bottom">✦ Open source matters</div>
        </div>
      </section>
      <section id="featured" className="featured-section">
        <div className="section-heading"><div><span className="eyebrow">A FEW PEOPLE TO KNOW</span><h2>Meet the makers.</h2></div><Link to="/users" className="text-link">View all developers ↗</Link></div>
        <div className="grid">{developers.slice(0,3).map(user=><UserCard key={user.id} user={user}/>)}</div>
      </section>
      <section className="ws-home">
        <div className="section-heading"><div><span className="eyebrow">TEAMS AT WORK</span><h2>Projects with a leader and a team.</h2></div><Link to="/projects" className="text-link">All projects ↗</Link></div>
        <div className="grid">{activeProjects.map((p) => <ProjectCard key={p.id} project={p} />)}</div>
      </section>
      <section className="ws-home">
        <div className="section-heading"><div><span className="eyebrow">REAL PROBLEMS · REAL ANSWERS</span><h2>Help the developer community.</h2></div><Link to="/community" className="text-link">Community help ↗</Link></div>
        <div className="ws-help-strip">{openProblems.map((q) => <Link key={q.id} to={`/community/${q.id}`}><span className="small muted">{q.tags.join(' · ')}</span><b>{q.title}</b><span className="small muted">{q.answers.length} answers · {q.upvotes.length} votes</span></Link>)}</div>
      </section>
      <p className="data-note">Profiles highlight public developer work and links. Some biographical summaries are editorial; verify details on each developer’s linked profiles.</p>
    </div>
  );
}
