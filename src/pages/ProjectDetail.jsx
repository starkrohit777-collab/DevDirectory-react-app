import { useSearchParams, useParams, Link, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getMember, isLead, progressOf } from '../utils/workspace.js';
import { AvatarStack, HealthBadge, ProgressBar, StatusBadge } from '../components/workspace/Parts.jsx';
import OverviewTab from '../components/workspace/OverviewTab.jsx';
import TeamTab from '../components/workspace/TeamTab.jsx';
import TasksTab from '../components/workspace/TasksTab.jsx';
import DiscussionTab from '../components/workspace/DiscussionTab.jsx';
import ActivityTab from '../components/workspace/ActivityTab.jsx';
import HelpTab from '../components/workspace/HelpTab.jsx';
import NotFound from './NotFound.jsx';

const TABS = [
  ['overview', 'Overview'], ['tasks', 'Tasks'], ['discussion', 'Discussion'],
  ['team', 'Team'], ['activity', 'Activity'], ['help', 'Community help'],
];

export default function ProjectDetail() {
  const { id } = useParams();
  const { projects, deleteProject } = useWorkspace();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === id);

  if (!project) return <NotFound message={`No project with id “${id}” exists.`} />;

  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'overview';
  const setTab = (k) => setParams(k === 'overview' ? {} : { tab: k }, { replace: true });
  const lead = isLead(project, user);
  const member = lead ? getMember(project, user) || { role: 'Project lead' } : getMember(project, user);
  const actor = user ? user.name : '';
  const leader = (project.members || []).find((m) => m.key === project.leadKey);
  const shared = { project, lead, member, user, actor };
  const pendingRequests = lead ? (project.requests || []).length : 0;

  return (
    <section>
      <Link to="/projects" className="back">← All projects</Link>
      <header className="ws-hero">
        <div className="ws-hero-main">
          <div className="ws-thread-meta">
            <StatusBadge status={project.status} />
            <HealthBadge project={project} />
            {lead && <span className="ws-badge status-active">You lead this</span>}
            {!lead && member && <span className="ws-badge status-planning">You're a member</span>}
          </div>
          <h1 className="ws-h1">{project.name}</h1>
          <p className="lead ws-lead">{project.tagline}</p>
          <p className="small muted">
            Led by <b>{leader ? leader.name : (project.ownerName || '—')}</b> · {(project.members || []).length} developers · started {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="ws-hero-side">
          <AvatarStack members={project.members || []} max={5} />
          <div className="ws-hero-progress">
            <div className="ws-row-between small muted">
              <span>Progress</span>
              <span>{progressOf(project)}%</span>
            </div>
            <ProgressBar value={progressOf(project)} />
          </div>
        </div>
      </header>

      <div className="ws-tabs" role="tablist" aria-label="Project sections">
        {TABS.map(([k, label]) => (
          <button
            key={k}
            role="tab"
            type="button"
            aria-selected={tab === k}
            className={`ws-tab${tab === k ? ' on' : ''}`}
            onClick={() => setTab(k)}
          >
            {label}
            {k === 'team' && pendingRequests > 0 && <span className="ws-pip">{pendingRequests}</span>}
          </button>
        ))}
      </div>

      <div className="ws-tabpanel" role="tabpanel">
        {tab === 'overview' && <OverviewTab {...shared} onOpenTab={setTab} />}
        {tab === 'tasks' && <TasksTab {...shared} />}
        {tab === 'discussion' && <DiscussionTab {...shared} />}
        {tab === 'team' && <TeamTab {...shared} />}
        {tab === 'activity' && <ActivityTab {...shared} />}
        {tab === 'help' && <HelpTab {...shared} />}
      </div>

      {lead && (
        <p className="ws-danger small">
          <button
            type="button"
            className="ws-linkbtn"
            onClick={() => {
              if (window.confirm(`Delete “${project.name}” permanently?`)) {
                deleteProject(project.id);
                navigate('/projects');
              }
            }}
          >
            Delete this project
          </button>
        </p>
      )}
      {!user && (
        <p className="data-note ws-note">
          Browsing as a guest.{' '}
          <Link className="text-link" to="/login" state={{ from: { pathname: `/projects/${project.id}` } }}>
            Log in
          </Link>{' '}
          or{' '}
          <Link className="text-link" to="/signup" state={{ from: { pathname: `/projects/${project.id}` } }}>
            Sign up
          </Link>{' '}
          to join, comment, and track work.
        </p>
      )}
    </section>
  );
}
