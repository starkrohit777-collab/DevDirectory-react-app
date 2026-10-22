import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { getInitialSeedData, hashPassword, verifyPassword } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let inMemoryDb = null;

export function loadDb() {
  if (inMemoryDb) return inMemoryDb;

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      inMemoryDb = JSON.parse(raw);
      if (!inMemoryDb.users || !inMemoryDb.projects || !inMemoryDb.problems) {
        throw new Error('Incomplete database structure');
      }
      return inMemoryDb;
    } catch (err) {
      console.warn('Corrupt or outdated db.json, re-initializing from seed data:', err.message);
    }
  }

  inMemoryDb = getInitialSeedData();
  saveDb(inMemoryDb);
  return inMemoryDb;
}

export function saveDb(data) {
  inMemoryDb = data;
  const tempFile = path.join(DATA_DIR, `db.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}`);
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempFile, DB_FILE);
}

export function sanitizeUser(u) {
  if (!u) return null;
  const { passwordHash, passwordSalt, ...safe } = u;
  return safe;
}

// --------------------------------------------------------------------------
// Auth & User Management
// --------------------------------------------------------------------------

export function findUserByEmail(email) {
  if (!email) return null;
  const db = loadDb();
  const normalized = email.trim().toLowerCase();
  return db.users.find((u) => u.email.toLowerCase() === normalized) || null;
}

export function findUserById(id) {
  if (!id) return null;
  const db = loadDb();
  return db.users.find((u) => u.id === id) || null;
}

export function getAllUsers() {
  const db = loadDb();
  return db.users.map(sanitizeUser);
}

export function createUser({ name, email, password, username, role, bio, skills, location, company, avatar, github, website }) {
  const db = loadDb();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = (username || name.toLowerCase().replace(/[^a-z0-9]/g, '')).trim();

  if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    const error = new Error('An account with this email address already exists.');
    error.status = 409;
    throw error;
  }

  const { hash, salt } = hashPassword(password);
  const userId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const newUser = {
    id: userId,
    devId: null,
    name: name.trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    role: role?.trim() || 'Software Developer',
    bio: bio?.trim() || '',
    skills: Array.isArray(skills) ? skills : (skills || '').split(',').map((s) => s.trim()).filter(Boolean),
    avatar: avatar?.trim() || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(normalizedUsername)}`,
    location: location?.trim() || 'Remote',
    company: company?.trim() || 'Independent',
    github: github?.trim() || (normalizedUsername ? `https://github.com/${normalizedUsername}` : ''),
    website: website?.trim() || '',
    passwordHash: hash,
    passwordSalt: salt,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDb(db);
  return sanitizeUser(newUser);
}

export function authenticateUser(email, password) {
  const user = findUserByEmail(email);
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }

  const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!isValid) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }

  return sanitizeUser(user);
}

export function createSession(userId) {
  const db = loadDb();
  const token = `tok_${crypto.randomBytes(32).toString('hex')}`;
  if (!db.sessions) db.sessions = {};
  db.sessions[token] = {
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
  };
  saveDb(db);
  return token;
}

export function getUserByToken(token) {
  if (!token) return null;
  const db = loadDb();
  const session = db.sessions?.[token];
  if (!session) return null;

  if (new Date(session.expiresAt) < new Date()) {
    delete db.sessions[token];
    saveDb(db);
    return null;
  }

  const user = db.users.find((u) => u.id === session.userId);
  return sanitizeUser(user);
}

export function removeSession(token) {
  const db = loadDb();
  if (db.sessions?.[token]) {
    delete db.sessions[token];
    saveDb(db);
  }
}

// --------------------------------------------------------------------------
// Projects & Workspaces
// --------------------------------------------------------------------------

export function getProjects({ status, q, mineEmail } = {}) {
  const db = loadDb();
  let list = db.projects;

  if (status && status !== 'All') {
    list = list.filter((p) => p.status === status);
  }

  if (mineEmail) {
    const emailLower = mineEmail.toLowerCase();
    list = list.filter((p) =>
      p.ownerEmail?.toLowerCase() === emailLower ||
      p.members?.some((m) => m.email?.toLowerCase() === emailLower)
    );
  }

  if (q) {
    const query = q.trim().toLowerCase();
    list = list.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      p.tagline?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.tags?.some((t) => t.toLowerCase().includes(query)) ||
      p.members?.some((m) => m.name.toLowerCase().includes(query))
    );
  }

  return list;
}

export function getProjectById(id) {
  const db = loadDb();
  return db.projects.find((p) => p.id === id) || null;
}

export function createProject(payload, user) {
  const db = loadDb();
  const timestamp = new Date().toISOString();
  const slug = payload.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 30);
  const id = `p-${slug || 'project'}-${Date.now().toString(36)}`;
  const leadKey = user?.email ? `user-${user.email}` : `usr-${Date.now()}`;
  const leadName = user?.name || 'Anonymous';
  const leadEmail = user?.email || '';

  const project = {
    id,
    name: payload.name.trim(),
    tagline: payload.tagline.trim(),
    description: payload.description.trim(),
    status: payload.status || 'Planning',
    tags: Array.isArray(payload.tags)
      ? payload.tags
      : (payload.tags || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 6),
    repo: payload.repo?.trim() || '',
    demoUrl: payload.demoUrl?.trim() || '',
    leadKey,
    ownerEmail: leadEmail,
    ownerName: leadName,
    createdAt: timestamp,
    updatedAt: timestamp,
    members: [
      {
        key: leadKey,
        devId: user?.devId || null,
        name: leadName,
        email: leadEmail,
        role: 'Project lead',
        avatar: user?.avatar || '',
        joinedAt: timestamp,
      },
    ],
    requests: [],
    milestones: Array.isArray(payload.milestones)
      ? payload.milestones
      : [
          { id: 'm-1', title: 'Initial Project Planning & Scope', due: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), done: false },
          { id: 'm-2', title: 'Architecture & MVP Delivery', due: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10), done: false },
        ],
    tasks: Array.isArray(payload.tasks) ? payload.tasks : [],
    threads: [
      {
        id: `th-${Date.now()}-1`,
        kind: 'Announcement',
        title: `Welcome to ${payload.name.trim()}!`,
        body: 'Project workspace initialized. Feel free to contribute ideas, pick up tasks, and join discussions.',
        author: leadName,
        at: timestamp,
        pinned: true,
        upvotes: [leadName],
        replies: [],
      },
    ],
    activity: [
      {
        id: `a-${Date.now()}-1`,
        actor: leadName,
        text: 'created the project',
        at: timestamp,
      },
    ],
  };

  db.projects.unshift(project);
  saveDb(db);
  return project;
}

export function updateProject(id, updates, actorName = 'System') {
  const db = loadDb();
  const index = db.projects.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const current = db.projects[index];
  const timestamp = new Date().toISOString();
  const changes = { ...updates };
  delete changes.id;
  delete changes.createdAt;

  let activityText = 'updated project details';
  if (changes.status && changes.status !== current.status) {
    activityText = `changed project status to ${changes.status}`;
  }

  const updated = {
    ...current,
    ...changes,
    updatedAt: timestamp,
    activity: [
      { id: `a-${Date.now()}`, actor: actorName, text: activityText, at: timestamp },
      ...current.activity,
    ].slice(0, 100),
  };

  db.projects[index] = updated;
  saveDb(db);
  return updated;
}

export function deleteProject(id) {
  const db = loadDb();
  const initialLength = db.projects.length;
  db.projects = db.projects.filter((p) => p.id !== id);
  db.problems = db.problems.map((q) => (q.projectId === id ? { ...q, projectId: '' } : q));
  saveDb(db);
  return db.projects.length < initialLength;
}

export function addProjectTask(projectId, taskData, actorName = 'System') {
  const db = loadDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) return null;

  const timestamp = new Date().toISOString();
  const newTask = {
    id: `t-${Date.now()}`,
    title: taskData.title.trim(),
    desc: taskData.desc?.trim() || '',
    assignee: taskData.assignee || null,
    status: taskData.status || 'todo',
    priority: taskData.priority || 'Medium',
    due: taskData.due || '',
    blocked: !!taskData.blocked,
    blocker: taskData.blocker?.trim() || '',
    createdAt: timestamp,
  };

  project.tasks.push(newTask);
  project.updatedAt = timestamp;
  project.activity.unshift({
    id: `a-${Date.now()}`,
    actor: actorName,
    text: `added task: “${newTask.title}”`,
    at: timestamp,
  });
  if (project.activity.length > 100) project.activity = project.activity.slice(0, 100);

  saveDb(db);
  return newTask;
}

export function updateProjectTask(projectId, taskId, updates, actorName = 'System') {
  const db = loadDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) return null;

  const taskIndex = project.tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) return null;

  const currentTask = project.tasks[taskIndex];
  const timestamp = new Date().toISOString();

  let log = `updated task “${currentTask.title}”`;
  if (updates.status && updates.status !== currentTask.status) {
    log = `moved “${currentTask.title}” to ${updates.status}`;
  } else if (updates.blocked && !currentTask.blocked) {
    log = `flagged blocker on “${currentTask.title}”`;
  } else if (!updates.blocked && currentTask.blocked) {
    log = `resolved blocker on “${currentTask.title}”`;
  }

  project.tasks[taskIndex] = { ...currentTask, ...updates };
  project.updatedAt = timestamp;
  project.activity.unshift({
    id: `a-${Date.now()}`,
    actor: actorName,
    text: log,
    at: timestamp,
  });
  if (project.activity.length > 100) project.activity = project.activity.slice(0, 100);

  saveDb(db);
  return project.tasks[taskIndex];
}

export function deleteProjectTask(projectId, taskId, actorName = 'System') {
  const db = loadDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) return false;

  const task = project.tasks.find((t) => t.id === taskId);
  if (!task) return false;

  project.tasks = project.tasks.filter((t) => t.id !== taskId);
  const timestamp = new Date().toISOString();
  project.updatedAt = timestamp;
  project.activity.unshift({
    id: `a-${Date.now()}`,
    actor: actorName,
    text: `deleted task “${task.title}”`,
    at: timestamp,
  });
  if (project.activity.length > 100) project.activity = project.activity.slice(0, 100);

  saveDb(db);
  return true;
}

export function addProjectMember(projectId, memberData, actorName = 'System') {
  const db = loadDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) return null;

  if (project.members.some((m) => m.key === memberData.key || (memberData.email && m.email === memberData.email))) {
    return project;
  }

  const timestamp = new Date().toISOString();
  const newMember = {
    key: memberData.key,
    devId: memberData.devId || null,
    name: memberData.name,
    email: memberData.email || '',
    role: memberData.role || 'Contributor',
    avatar: memberData.avatar || '',
    joinedAt: timestamp,
  };

  project.members.push(newMember);
  project.requests = project.requests.filter((r) => r.key !== memberData.key && r.email !== memberData.email);
  project.updatedAt = timestamp;
  project.activity.unshift({
    id: `a-${Date.now()}`,
    actor: actorName,
    text: `added ${memberData.name} as ${newMember.role}`,
    at: timestamp,
  });
  if (project.activity.length > 100) project.activity = project.activity.slice(0, 100);

  saveDb(db);
  return project;
}

export function updateProjectMember(projectId, memberKey, updates, actorName = 'System') {
  const db = loadDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) return null;

  const member = project.members.find((m) => m.key === memberKey);
  if (!member) return null;

  const timestamp = new Date().toISOString();
  Object.assign(member, updates);
  project.updatedAt = timestamp;
  project.activity.unshift({
    id: `a-${Date.now()}`,
    actor: actorName,
    text: `updated role for ${member.name} to ${member.role}`,
    at: timestamp,
  });
  if (project.activity.length > 100) project.activity = project.activity.slice(0, 100);

  saveDb(db);
  return project;
}

export function removeProjectMember(projectId, memberKey, actorName = 'System') {
  const db = loadDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) return null;

  const member = project.members.find((m) => m.key === memberKey);
  if (!member) return null;

  project.members = project.members.filter((m) => m.key !== memberKey);
  const timestamp = new Date().toISOString();
  project.updatedAt = timestamp;
  project.activity.unshift({
    id: `a-${Date.now()}`,
    actor: actorName,
    text: `removed ${member.name} from the project`,
    at: timestamp,
  });
  if (project.activity.length > 100) project.activity = project.activity.slice(0, 100);

  saveDb(db);
  return project;
}

export function addProjectRequest(projectId, requestData) {
  const db = loadDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) return null;

  const timestamp = new Date().toISOString();
  const req = {
    key: `req-${Date.now()}`,
    name: requestData.name,
    email: requestData.email,
    message: requestData.message || '',
    at: timestamp,
  };

  project.requests.push(req);
  project.updatedAt = timestamp;
  project.activity.unshift({
    id: `a-${Date.now()}`,
    actor: req.name,
    text: 'requested to join the team',
    at: timestamp,
  });
  if (project.activity.length > 100) project.activity = project.activity.slice(0, 100);

  saveDb(db);
  return req;
}

export function addProjectThread(projectId, threadData, actorName = 'System') {
  const db = loadDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) return null;

  const timestamp = new Date().toISOString();
  const newThread = {
    id: `th-${Date.now()}`,
    kind: threadData.kind || 'Discussion',
    title: threadData.title.trim(),
    body: threadData.body.trim(),
    author: actorName,
    at: timestamp,
    pinned: !!threadData.pinned,
    upvotes: [actorName],
    replies: [],
  };

  project.threads.unshift(newThread);
  project.updatedAt = timestamp;
  project.activity.unshift({
    id: `a-${Date.now()}`,
    actor: actorName,
    text: `started ${newThread.kind.toLowerCase()}: “${newThread.title}”`,
    at: timestamp,
  });
  if (project.activity.length > 100) project.activity = project.activity.slice(0, 100);

  saveDb(db);
  return newThread;
}

export function replyProjectThread(projectId, threadId, replyData, actorName = 'System') {
  const db = loadDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) return null;

  const thread = project.threads.find((th) => th.id === threadId);
  if (!thread) return null;

  const timestamp = new Date().toISOString();
  const reply = {
    id: `r-${Date.now()}`,
    author: actorName,
    body: replyData.body.trim(),
    at: timestamp,
  };

  thread.replies.push(reply);
  project.updatedAt = timestamp;
  project.activity.unshift({
    id: `a-${Date.now()}`,
    actor: actorName,
    text: `replied in “${thread.title}”`,
    at: timestamp,
  });
  if (project.activity.length > 100) project.activity = project.activity.slice(0, 100);

  saveDb(db);
  return reply;
}

export function upvoteProjectThread(projectId, threadId, userName) {
  const db = loadDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) return null;

  const thread = project.threads.find((th) => th.id === threadId);
  if (!thread) return null;

  if (thread.upvotes.includes(userName)) {
    thread.upvotes = thread.upvotes.filter((u) => u !== userName);
  } else {
    thread.upvotes.push(userName);
  }

  saveDb(db);
  return thread;
}

export function updateProjectMilestones(projectId, milestones, actorName = 'System') {
  const db = loadDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) return null;

  project.milestones = milestones;
  const timestamp = new Date().toISOString();
  project.updatedAt = timestamp;
  project.activity.unshift({
    id: `a-${Date.now()}`,
    actor: actorName,
    text: 'updated project milestones',
    at: timestamp,
  });
  if (project.activity.length > 100) project.activity = project.activity.slice(0, 100);

  saveDb(db);
  return project.milestones;
}

// --------------------------------------------------------------------------
// Problems & Community Help
// --------------------------------------------------------------------------

export function getProblems({ status, tag, q, sort } = {}) {
  const db = loadDb();
  let list = db.problems;

  if (status && status !== 'All') {
    list = list.filter((p) => p.status === status);
  }

  if (tag) {
    list = list.filter((p) => p.tags?.includes(tag));
  }

  if (q) {
    const query = q.trim().toLowerCase();
    list = list.filter((p) =>
      p.title.toLowerCase().includes(query) ||
      p.body.toLowerCase().includes(query) ||
      p.tags?.some((t) => t.toLowerCase().includes(query))
    );
  }

  if (sort === 'top') {
    list = [...list].sort((a, b) => b.upvotes.length - a.upvotes.length);
  } else if (sort === 'unanswered') {
    list = [...list].sort((a, b) => a.answers.length - b.answers.length || new Date(b.at) - new Date(a.at));
  } else {
    list = [...list].sort((a, b) => new Date(b.at) - new Date(a.at));
  }

  return list;
}

export function getProblemById(id) {
  const db = loadDb();
  return db.problems.find((p) => p.id === id) || null;
}

export function createProblem(payload, user) {
  const db = loadDb();
  const timestamp = new Date().toISOString();
  const id = `prob-${Date.now()}`;
  const author = user?.name || payload.author || 'Anonymous';

  const newProblem = {
    id,
    title: payload.title.trim(),
    body: payload.body.trim(),
    tags: Array.isArray(payload.tags)
      ? payload.tags
      : (payload.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    author,
    authorEmail: user?.email || '',
    at: timestamp,
    status: 'Open',
    projectId: payload.projectId || '',
    upvotes: [author],
    answers: [],
  };

  db.problems.unshift(newProblem);
  saveDb(db);
  return newProblem;
}

export function addProblemAnswer(problemId, { body }, user) {
  const db = loadDb();
  const problem = db.problems.find((p) => p.id === problemId);
  if (!problem) return null;

  const timestamp = new Date().toISOString();
  const author = user?.name || 'Anonymous';
  const newAnswer = {
    id: `ans-${Date.now()}`,
    author,
    authorEmail: user?.email || '',
    body: body.trim(),
    at: timestamp,
    accepted: false,
    upvotes: [author],
  };

  problem.answers.push(newAnswer);
  saveDb(db);
  return newAnswer;
}

export function upvoteProblem(problemId, userName) {
  const db = loadDb();
  const problem = db.problems.find((p) => p.id === problemId);
  if (!problem) return null;

  if (problem.upvotes.includes(userName)) {
    problem.upvotes = problem.upvotes.filter((u) => u !== userName);
  } else {
    problem.upvotes.push(userName);
  }

  saveDb(db);
  return problem;
}

export function markProblemSolution(problemId, answerId) {
  const db = loadDb();
  const problem = db.problems.find((p) => p.id === problemId);
  if (!problem) return null;

  problem.answers.forEach((ans) => {
    ans.accepted = (ans.id === answerId);
  });
  problem.status = 'Solved';

  saveDb(db);
  return problem;
}

// --------------------------------------------------------------------------
// Overall Platform Stats
// --------------------------------------------------------------------------

export function getStats() {
  const db = loadDb();
  const totalProjects = db.projects.length;
  const activeProjects = db.projects.filter((p) => p.status === 'Active').length;
  const totalTasks = db.projects.reduce((n, p) => n + (p.tasks?.length || 0), 0);
  const doneTasks = db.projects.reduce((n, p) => n + (p.tasks?.filter((t) => t.status === 'done').length || 0), 0);
  const people = new Set(db.projects.flatMap((p) => p.members?.map((m) => m.name) || [])).size;
  const solvedProblems = db.problems.filter((p) => p.status === 'Solved').length;

  return {
    totalProjects,
    activeProjects,
    totalTasks,
    doneTasks,
    peopleCollaborating: people,
    solvedProblems,
  };
}

export function resetToDemo() {
  const freshData = getInitialSeedData();
  saveDb(freshData);
  return freshData;
}
