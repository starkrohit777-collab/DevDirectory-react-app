import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { seedProjects, seedProblems } from '../data/workspace.js';
import { uid } from '../utils/workspace.js';
import projectService from '../services/projectService.js';

const WorkspaceContext = createContext(null);
const KEY = 'devdirectory_workspace_v1';

const fresh = () => ({ projects: seedProjects(), problems: seedProblems() });
const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && Array.isArray(saved.projects) && Array.isArray(saved.problems)) return saved;
  } catch { /* ignore corrupt storage */ }
  return fresh();
};

const now = () => new Date().toISOString();
const toggle = (list, name) => (list.includes(name) ? list.filter((n) => n !== name) : [...list, name]);

export function WorkspaceProvider({ children }) {
  const [data, setData] = useState(load);
  const [syncing, setSyncing] = useState(false);

  // Synchronize with backend API on mount
  useEffect(() => {
    let isMounted = true;
    const fetchRemoteData = async () => {
      try {
        const [remoteProjects, remoteProblems] = await Promise.all([
          projectService.getProjects(),
          projectService.getProblems(),
        ]);
        if (isMounted && Array.isArray(remoteProjects) && remoteProjects.length > 0) {
          setData({
            projects: remoteProjects,
            problems: Array.isArray(remoteProblems) ? remoteProblems : [],
          });
        }
      } catch (err) {
        console.warn('Backend sync paused or offline, using local storage cache:', err.message);
      }
    };

    fetchRemoteData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist to localStorage cache
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch { /* storage full / blocked */ }
  }, [data]);

  // Update one project and (optionally) record an activity entry.
  const patch = useCallback((pid, fn, actor, text) => {
    const entry = text ? { id: uid('a'), actor, text, at: now() } : null;
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) => {
        if (p.id !== pid) return p;
        const next = fn(p);
        return entry ? { ...next, activity: [entry, ...next.activity].slice(0, 100) } : next;
      }),
    }));
  }, []);

  const patchProblem = useCallback((qid, fn) => {
    setData((d) => ({ ...d, problems: d.problems.map((q) => (q.id === qid ? fn(q) : q)) }));
  }, []);

  const actions = useMemo(() => ({
    // ---------- projects ----------
    createProject(form, user) {
      const id = uid('p');
      const leadKey = `user-${user.email || 'anon'}`;
      const project = {
        id,
        name: form.name,
        tagline: form.tagline,
        description: form.description,
        status: form.status || 'Planning',
        tags: form.tags,
        repo: form.repo || '',
        leadKey,
        ownerEmail: user.email || '',
        createdAt: now(),
        updatedAt: now(),
        members: [{ key: leadKey, devId: user.devId || null, name: user.name, email: user.email, role: 'Project lead' }],
        requests: [],
        milestones: [
          { id: 'm-1', title: 'Initial Project Planning & Scope', due: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), done: false },
          { id: 'm-2', title: 'Architecture & MVP Delivery', due: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10), done: false },
        ],
        tasks: [],
        threads: [
          {
            id: uid('th'),
            kind: 'Announcement',
            title: `Welcome to ${form.name}!`,
            body: 'Project workspace initialized. Feel free to contribute ideas, pick up tasks, and join discussions.',
            author: user.name,
            at: now(),
            pinned: true,
            upvotes: [user.name],
            replies: [],
          },
        ],
        activity: [{ id: uid('a'), actor: user.name, text: 'created the project', at: now() }],
      };

      // Optimistic local update
      setData((d) => ({ ...d, projects: [project, ...d.projects] }));

      // Asynchronous backend persistence
      projectService.createProject(form).then((remote) => {
        if (remote?.id) {
          setData((d) => ({
            ...d,
            projects: d.projects.map((p) => (p.id === id ? { ...remote, id } : p)),
          }));
        }
      }).catch((err) => console.warn('Could not persist new project to backend:', err.message));

      return id;
    },

    updateProject(pid, changes, actor) {
      patch(pid, (p) => ({ ...p, ...changes }), actor, changes.status ? `changed project status to ${changes.status}` : 'updated project details');
      projectService.updateProject(pid, changes).catch((err) => console.warn('Failed to update project on backend:', err.message));
    },

    deleteProject(pid) {
      setData((d) => ({
        ...d,
        projects: d.projects.filter((p) => p.id !== pid),
        problems: d.problems.map((q) => (q.projectId === pid ? { ...q, projectId: '' } : q)),
      }));
      projectService.deleteProject(pid).catch((err) => console.warn('Failed to delete project on backend:', err.message));
    },

    // ---------- team ----------
    addMember(pid, member, actor) {
      patch(pid, (p) => (p.members.some((m) => m.key === member.key) ? p : { ...p, members: [...p.members, member] }), actor, `added ${member.name} to the team`);
      projectService.addMember(pid, member).catch((err) => console.warn('Backend sync member error:', err.message));
    },

    removeMember(pid, key, actor) {
      patch(pid, (p) => {
        const m = p.members.find((x) => x.key === key);
        if (!m || key === p.leadKey) return p;
        return {
          ...p,
          members: p.members.filter((x) => x.key !== key),
          tasks: p.tasks.map((t) => (t.assignee === key ? { ...t, assignee: null } : t)),
        };
      }, actor, 'removed a team member');
      projectService.removeMember(pid, key).catch((err) => console.warn('Backend sync member error:', err.message));
    },

    setMemberRole(pid, key, role, actor) {
      patch(pid, (p) => ({ ...p, members: p.members.map((m) => (m.key === key ? { ...m, role } : m)) }), actor, 'updated a member role');
      projectService.updateMember(pid, key, { role }).catch((err) => console.warn('Backend sync role error:', err.message));
    },

    transferLead(pid, key, actor) {
      patch(pid, (p) => ({
        ...p,
        leadKey: key,
        ownerEmail: '',
        members: p.members.map((m) => (m.key === key ? { ...m, role: 'Project lead' } : m.key === p.leadKey ? { ...m, role: 'Core developer' } : m)),
      }), actor, 'transferred project leadership');
      projectService.updateProject(pid, { leadKey: key }).catch((err) => console.warn('Backend sync lead error:', err.message));
    },

    requestJoin(pid, user, message) {
      patch(pid, (p) => (p.requests.some((r) => r.email === user.email) ? p : {
        ...p,
        requests: [{ key: uid('req'), name: user.name, email: user.email, message, at: now() }, ...p.requests],
      }), user.name, 'asked to join the project');
      projectService.sendJoinRequest(pid, { name: user.name, email: user.email, message }).catch((err) => console.warn('Backend join request error:', err.message));
    },

    resolveRequest(pid, req, approve, actor) {
      patch(pid, (p) => ({
        ...p,
        requests: p.requests.filter((r) => r.key !== req.key),
        members: approve ? [...p.members, { key: `user-${req.email}`, devId: null, name: req.name, email: req.email, role: 'Contributor' }] : p.members,
      }), actor, approve ? `welcomed ${req.name} to the team` : `declined a join request from ${req.name}`);

      if (approve) {
        projectService.addMember(pid, { key: `user-${req.email}`, name: req.name, email: req.email, role: 'Contributor' })
          .catch((err) => console.warn('Backend member error:', err.message));
      }
    },

    // ---------- tasks ----------
    addTask(pid, t, actor) {
      const task = { id: uid('t'), desc: '', assignee: null, status: 'todo', priority: 'Medium', due: '', blocked: false, blocker: '', createdAt: now(), ...t };
      patch(pid, (p) => ({ ...p, tasks: [...p.tasks, task] }), actor, `created task “${task.title}”`);
      projectService.addTask(pid, task).catch((err) => console.warn('Backend task error:', err.message));
    },

    updateTask(pid, tid, changes, actor, text) {
      patch(pid, (p) => ({ ...p, tasks: p.tasks.map((t) => (t.id === tid ? { ...t, ...changes } : t)) }), actor, text);
      projectService.updateTask(pid, tid, changes).catch((err) => console.warn('Backend task error:', err.message));
    },

    deleteTask(pid, tid, actor) {
      patch(pid, (p) => ({ ...p, tasks: p.tasks.filter((t) => t.id !== tid) }), actor, 'removed a task');
      projectService.deleteTask(pid, tid).catch((err) => console.warn('Backend task error:', err.message));
    },

    // ---------- milestones ----------
    addMilestone(pid, m, actor) {
      patch(pid, (p) => {
        const milestones = [...p.milestones, { id: uid('m'), done: false, ...m }];
        projectService.updateMilestones(pid, milestones).catch((err) => console.warn('Backend milestone error:', err.message));
        return { ...p, milestones };
      }, actor, `added milestone “${m.title}”`);
    },

    toggleMilestone(pid, mid, actor) {
      patch(pid, (p) => {
        const milestones = p.milestones.map((m) => (m.id === mid ? { ...m, done: !m.done } : m));
        projectService.updateMilestones(pid, milestones).catch((err) => console.warn('Backend milestone error:', err.message));
        return { ...p, milestones };
      }, actor, 'updated a milestone');
    },

    deleteMilestone(pid, mid, actor) {
      patch(pid, (p) => {
        const milestones = p.milestones.filter((m) => m.id !== mid);
        projectService.updateMilestones(pid, milestones).catch((err) => console.warn('Backend milestone error:', err.message));
        return { ...p, milestones };
      }, actor, 'removed a milestone');
    },

    // ---------- discussion ----------
    addThread(pid, t, actor) {
      const thread = { id: uid('th'), pinned: false, upvotes: [], replies: [], at: now(), author: actor, ...t };
      patch(pid, (p) => ({ ...p, threads: [thread, ...p.threads] }), actor, `started a ${t.kind.toLowerCase()}: “${t.title}”`);
      projectService.addThread(pid, t).catch((err) => console.warn('Backend thread error:', err.message));
      return thread.id;
    },

    replyThread(pid, tid, body, actor, title) {
      const reply = { id: uid('r'), author: actor, body, at: now() };
      patch(pid, (p) => ({ ...p, threads: p.threads.map((t) => (t.id === tid ? { ...t, replies: [...t.replies, reply] } : t)) }), actor, `replied in “${title}”`);
      projectService.replyThread(pid, tid, { body }).catch((err) => console.warn('Backend reply error:', err.message));
    },

    upvoteThread(pid, tid, actor) {
      patch(pid, (p) => ({ ...p, threads: p.threads.map((t) => (t.id === tid ? { ...t, upvotes: toggle(t.upvotes, actor) } : t)) }));
      projectService.upvoteThread(pid, tid).catch((err) => console.warn('Backend upvote error:', err.message));
    },

    pinThread(pid, tid, actor) {
      patch(pid, (p) => ({ ...p, threads: p.threads.map((t) => (t.id === tid ? { ...t, pinned: !t.pinned } : t)) }), actor, 'pinned or unpinned a thread');
    },

    deleteThread(pid, tid, actor) {
      patch(pid, (p) => ({ ...p, threads: p.threads.filter((t) => t.id !== tid) }), actor, 'removed a thread');
    },

    // ---------- community help board ----------
    addProblem(q, user) {
      const id = uid('q');
      const newProb = { id, projectId: '', upvotes: [user.name], answers: [], status: 'Open', at: now(), author: user.name, ...q };
      setData((d) => ({ ...d, problems: [newProb, ...d.problems] }));
      projectService.createProblem(q).catch((err) => console.warn('Backend problem error:', err.message));
      return id;
    },

    deleteProblem(qid) {
      setData((d) => ({ ...d, problems: d.problems.filter((q) => q.id !== qid) }));
    },

    voteProblem(qid, actor) {
      patchProblem(qid, (q) => ({ ...q, upvotes: toggle(q.upvotes, actor) }));
      projectService.upvoteProblem(qid).catch((err) => console.warn('Backend upvote error:', err.message));
    },

    addAnswer(qid, body, actor) {
      patchProblem(qid, (q) => ({ ...q, answers: [...q.answers, { id: uid('ans'), author: actor, body, at: now(), votes: [], accepted: false }] }));
      projectService.addProblemAnswer(qid, { body }).catch((err) => console.warn('Backend answer error:', err.message));
    },

    voteAnswer(qid, aid, actor) {
      patchProblem(qid, (q) => ({ ...q, answers: q.answers.map((a) => (a.id === aid ? { ...a, votes: toggle(a.votes, actor) } : a)) }));
    },

    acceptAnswer(qid, aid) {
      patchProblem(qid, (q) => {
        const already = q.answers.find((a) => a.id === aid)?.accepted;
        return {
          ...q,
          status: already ? 'Open' : 'Solved',
          answers: q.answers.map((a) => ({ ...a, accepted: a.id === aid ? !already : false })),
        };
      });
      projectService.markProblemSolution(qid, aid).catch((err) => console.warn('Backend solve error:', err.message));
    },

    linkProblem(qid, projectId) {
      patchProblem(qid, (q) => ({ ...q, projectId }));
    },

    async resetDemo() {
      try {
        await projectService.resetDemo();
      } catch (e) {
        console.warn('Backend reset error, falling back locally:', e.message);
      }
      setData(fresh());
    },
  }), [patch, patchProblem]);

  const value = useMemo(() => ({ ...data, ...actions, syncing }), [data, actions, syncing]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export const useWorkspace = () => useContext(WorkspaceContext);
