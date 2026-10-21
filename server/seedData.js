import crypto from 'node:crypto';
import { developers } from '../src/data/developers.js';
import { seedProjects, seedProblems } from '../src/data/workspace.js';

export function hashPassword(password, salt) {
  if (!salt) salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password, hash, salt) {
  const calculated = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return calculated === hash;
}

export function getInitialSeedData() {
  const defaultPassword = 'password123';
  const { hash: defaultHash, salt: defaultSalt } = hashPassword(defaultPassword);

  const users = [
    {
      id: 'usr-asha',
      devId: 999,
      name: 'Asha Verma',
      username: 'ashaverma',
      email: 'asha@company.dev',
      role: 'Full Stack Engineer',
      bio: 'Building accessible and scalable web products. Passionate about community tools.',
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&auto=format&fit=crop&q=80',
      passwordHash: defaultHash,
      passwordSalt: defaultSalt,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    ...developers.map((dev) => {
      const { hash, salt } = hashPassword(defaultPassword);
      return {
        id: `usr-dev-${dev.id}`,
        devId: dev.id,
        name: dev.name,
        username: dev.username,
        email: dev.email,
        role: dev.role,
        bio: dev.bio,
        skills: dev.skills || [],
        avatar: dev.avatar || `https://github.com/${encodeURIComponent(dev.username)}.png?size=96`,
        location: dev.location,
        company: dev.company?.name || 'Open source',
        github: dev.github,
        website: dev.website,
        passwordHash: hash,
        passwordSalt: salt,
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      };
    }),
  ];

  const projects = seedProjects();
  const problems = seedProblems();

  const posts = [
    {
      id: 'post-1',
      userId: 1,
      title: 'A quick tour of server-first React architecture',
      body: 'Understanding the mental shift from client fetch loops to server components and streaming boundaries.',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'post-2',
      userId: 6,
      title: 'Accessible Design Systems in Practice',
      body: 'Why color contrast tokens and focus management must be built into components from day one.',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];

  return {
    users,
    projects,
    problems,
    posts,
    sessions: {},
  };
}
