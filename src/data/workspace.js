import { developers } from './developers.js';

// Demo data for the project workspace. Everything is stored in the browser (localStorage)
// once the app runs, so changes made by the user persist between visits.

const day = 864e5;
const ago = (d, h = 0) => new Date(Date.now() - d * day - h * 36e5).toISOString();
const ahead = (d) => new Date(Date.now() + d * day).toISOString().slice(0, 10);

const dev = (id, role) => {
  const d = developers.find((x) => x.id === id);
  return { key: `dev-${id}`, devId: id, name: d.name, email: d.email, role };
};

const task = (n, title, assignee, status, priority, due, extra = {}) => ({
  id: `t-${n}`, title, desc: extra.desc || '', assignee, status, priority, due: due == null ? '' : ahead(due),
  blocked: !!extra.blocked, blocker: extra.blocker || '', createdAt: ago(extra.age ?? 10),
});

const thread = (n, kind, title, body, author, age, replies = [], extra = {}) => ({
  id: `th-${n}`, kind, title, body, author, at: ago(age), pinned: !!extra.pinned, upvotes: extra.upvotes || [],
  replies: replies.map(([a, b, h], i) => ({ id: `r-${n}-${i}`, author: a, body: b, at: ago(age, -h) })),
});

const act = (n, actor, text, age) => ({ id: `a-${n}`, actor, text, at: ago(age) });

export const seedProjects = () => [
  {
    id: 'p-ui-kit', name: 'Accessible UI Kit', tagline: 'A component library where accessibility is the default.',
    description: 'Open component library with keyboard support, screen-reader tested patterns and design tokens. Goal: ship v1.0 with 24 production-ready components and full documentation.',
    status: 'Active', tags: ['React', 'Accessibility', 'Design systems'], repo: 'https://github.com/',
    leadKey: 'dev-6', ownerEmail: '', createdAt: ago(40),
    members: [dev(6, 'Project lead'), dev(1, 'Core developer'), dev(2, 'Testing'), dev(7, 'Docs & DX')],
    requests: [{ key: 'req-1', name: 'Riya Sharma', email: 'riya@example.dev', message: 'I have 3 years of a11y audit experience and can help with ARIA reviews.', at: ago(1) }],
    milestones: [
      { id: 'm-1', title: 'Design tokens finalised', due: ahead(-12), done: true },
      { id: 'm-2', title: 'Form components beta', due: ahead(9), done: false },
      { id: 'm-3', title: 'v1.0 public release', due: ahead(45), done: false },
    ],
    tasks: [
      task(1, 'Define colour-contrast tokens', 'dev-6', 'done', 'High', -10),
      task(2, 'Build accessible Dialog component', 'dev-1', 'doing', 'High', 3, { desc: 'Focus trap, ESC to close, return focus to trigger.' }),
      task(3, 'Write keyboard-navigation tests', 'dev-2', 'review', 'Medium', 2),
      task(4, 'Document Combobox patterns', 'dev-7', 'todo', 'Medium', 8),
      task(5, 'Fix Tooltip focus bug on Safari', 'dev-1', 'doing', 'Critical', -2, { blocked: true, blocker: 'Need a Safari 17 device to reproduce.' }),
      task(6, 'Set up automated axe-core CI check', null, 'todo', 'High', 6),
    ],
    threads: [
      thread(1, 'Announcement', 'Welcome & contribution rules', 'Please open a draft PR early, link it to a task, and request review from at least one other member. Weekly sync is on Thursday.', 'Sarah Drasner', 30, [['Dan Abramov', 'Got it — I will keep PRs small.', -2]], { pinned: true, upvotes: ['Dan Abramov', 'Kent C. Dodds'] }),
      thread(2, 'Decision', 'Should we use CSS variables or a JS theme object for tokens?', 'CSS variables work without a runtime and allow theming on any DOM subtree. A JS object gives type safety. Proposal: CSS variables + generated TypeScript types.', 'Lee Robinson', 6, [['Sarah Drasner', 'Agree. Generated types give us the best of both.', -3], ['Kent C. Dodds', '+1, and it keeps the bundle smaller.', -5]], { upvotes: ['Sarah Drasner', 'Kent C. Dodds', 'Dan Abramov'] }),
      thread(3, 'Question', 'How do we test screen-reader output reliably in CI?', 'Manual NVDA/VoiceOver testing does not scale. Has anyone automated this?', 'Kent C. Dodds', 2, []),
    ],
    activity: [
      act(1, 'Kent C. Dodds', 'asked a question: “How do we test screen-reader output reliably in CI?”', 2),
      act(2, 'Dan Abramov', 'moved “Fix Tooltip focus bug on Safari” to blocked', 3),
      act(3, 'Kent C. Dodds', 'moved “Write keyboard-navigation tests” to In review', 4),
      act(4, 'Lee Robinson', 'started a decision thread about design tokens', 6),
      act(5, 'Sarah Drasner', 'completed milestone “Design tokens finalised”', 12),
    ],
  },
  {
    id: 'p-collab', name: 'Realtime Collab Editor', tagline: 'Multiplayer text editing with conflict-free sync.',
    description: 'A lightweight collaborative editor using CRDTs, presence cursors and offline support. Built to learn and to be reused by other teams in the community.',
    status: 'Active', tags: ['TypeScript', 'WebSockets', 'CRDT'], repo: 'https://github.com/',
    leadKey: 'dev-3', ownerEmail: '', createdAt: ago(25),
    members: [dev(3, 'Project lead'), dev(8, 'Infrastructure'), dev(4, 'Performance')],
    requests: [],
    milestones: [
      { id: 'm-1', title: 'Local-first prototype', due: ahead(-5), done: true },
      { id: 'm-2', title: 'Presence & cursors', due: ahead(12), done: false },
    ],
    tasks: [
      task(1, 'Prototype CRDT document model', 'dev-3', 'done', 'High', -6),
      task(2, 'WebSocket reconnection strategy', 'dev-8', 'doing', 'High', 4),
      task(3, 'Profile large-document typing latency', 'dev-4', 'todo', 'Medium', 10),
      task(4, 'Presence cursor overlay', 'dev-3', 'todo', 'Medium', 11),
    ],
    threads: [
      thread(1, 'Discussion', 'Yjs vs Automerge — which should we build on?', 'Both are mature. Yjs is faster on large docs; Automerge has a friendlier data model. Let us list pros/cons here.', 'Theo Browne', 8, [['Addy Osmani', 'Benchmarks first, please. I can run a 1MB doc test.', -4]], { upvotes: ['Addy Osmani'] }),
    ],
    activity: [
      act(1, 'Addy Osmani', 'replied in “Yjs vs Automerge”', 8),
      act(2, 'Guillermo Rauch', 'moved “WebSocket reconnection strategy” to In progress', 9),
    ],
  },
  {
    id: 'p-perf', name: 'Performance Budget Dashboard', tagline: 'Track Core Web Vitals regressions per pull request.',
    description: 'Dashboard that posts performance budgets on every PR and graphs trends over time so slowdowns get caught before they ship.',
    status: 'Planning', tags: ['Performance', 'Node.js', 'CI'], repo: '',
    leadKey: 'dev-4', ownerEmail: '', createdAt: ago(6),
    members: [dev(4, 'Project lead'), dev(7, 'Frontend'), dev(5, 'Product & content')],
    requests: [],
    milestones: [{ id: 'm-1', title: 'MVP scope agreed', due: ahead(5), done: false }],
    tasks: [
      task(1, 'Write product requirements', 'dev-5', 'doing', 'High', 3),
      task(2, 'Choose metrics storage', 'dev-4', 'todo', 'Medium', 7),
      task(3, 'Wireframe dashboard views', 'dev-7', 'todo', 'Low', 9),
    ],
    threads: [thread(1, 'Question', 'Which metrics matter most to teams?', 'LCP, INP, CLS are obvious. Should we also track bundle size and JS execution time?', 'Cassidy Williams', 3, [['Addy Osmani', 'Yes — bundle size is the cheapest early signal.', -2]])],
    activity: [act(1, 'Cassidy Williams', 'asked a question: “Which metrics matter most to teams?”', 3)],
  },
  {
    id: 'p-mentor', name: 'Open Source Mentorship Portal', tagline: 'Match first-time contributors with friendly maintainers.',
    description: 'A portal that matches newcomers with maintainers, lists “good first issues” and tracks mentorship progress to reduce contributor drop-off.',
    status: 'Active', tags: ['Community', 'Open source', 'Next.js'], repo: 'https://github.com/',
    leadKey: 'dev-5', ownerEmail: '', createdAt: ago(60),
    members: [dev(5, 'Project lead'), dev(1, 'Maintainer liaison'), dev(2, 'Mentor'), dev(6, 'Design')],
    requests: [],
    milestones: [
      { id: 'm-1', title: 'Mentor onboarding flow', due: ahead(-20), done: true },
      { id: 'm-2', title: 'Matching algorithm v1', due: ahead(-3), done: true },
      { id: 'm-3', title: 'Public beta', due: ahead(14), done: false },
    ],
    tasks: [
      task(1, 'Mentor onboarding flow', 'dev-5', 'done', 'High', -20),
      task(2, 'Matching algorithm v1', 'dev-2', 'done', 'High', -3),
      task(3, 'Good-first-issue importer', 'dev-1', 'done', 'Medium', -1),
      task(4, 'Design progress tracker UI', 'dev-6', 'review', 'Medium', 2),
      task(5, 'Beta launch checklist', 'dev-5', 'doing', 'High', 10),
    ],
    threads: [thread(1, 'Announcement', 'Beta invite list is open', 'Share names of maintainers who would like to join the closed beta.', 'Cassidy Williams', 5, [], { pinned: true })],
    activity: [act(1, 'Sarah Drasner', 'moved “Design progress tracker UI” to In review', 1), act(2, 'Cassidy Williams', 'pinned “Beta invite list is open”', 5)],
  },
  {
    id: 'p-testing', name: 'Testing Playbook', tagline: 'Practical testing guidance for real-world teams.',
    description: 'A living handbook of testing strategies for front-end teams: what to test, what to skip, and how to keep suites fast and trustworthy.',
    status: 'On hold', tags: ['Testing', 'Docs'], repo: '',
    leadKey: 'dev-2', ownerEmail: '', createdAt: ago(90),
    members: [dev(2, 'Project lead'), dev(1, 'Reviewer')],
    requests: [],
    milestones: [{ id: 'm-1', title: 'Outline approved', due: ahead(-40), done: true }],
    tasks: [
      task(1, 'Outline chapters', 'dev-2', 'done', 'Medium', -40),
      task(2, 'Draft “Integration vs unit tests”', 'dev-2', 'todo', 'Medium', 20),
    ],
    threads: [], activity: [act(1, 'Kent C. Dodds', 'put the project on hold until next quarter', 20)],
  },
];

const prob = (n, title, body, tags, author, age, extra = {}) => ({
  id: `q-${n}`, title, body, tags, author, at: ago(age), projectId: extra.projectId || '',
  upvotes: extra.upvotes || [], status: extra.status || 'Open',
  answers: (extra.answers || []).map(([a, b, h, accepted], i) => ({ id: `ans-${n}-${i}`, author: a, body: b, at: ago(age, -h), votes: [], accepted: !!accepted })),
});

export const seedProblems = () => [
  prob(1, 'Burnout in small teams: how do you keep a sustainable pace?', 'Our 4-person team keeps committing to aggressive sprints. We are tired and quality is dropping. What practices actually worked for you?', ['Team health', 'Process'], 'Cassidy Williams', 4,
    { upvotes: ['Dan Abramov', 'Kent C. Dodds', 'Sarah Drasner'], answers: [['Kent C. Dodds', 'Commit to less. Plan to 70% capacity, keep a buffer for bugs, and have a "no new work mid-sprint" rule. Track cycle time, not hours.', 3, false]] }),
  prob(2, 'Legacy jQuery app: rewrite or migrate gradually?', 'We maintain a 10-year-old jQuery app with no tests. Management wants a full React rewrite. Is that wise?', ['Legacy', 'Architecture'], 'Lee Robinson', 9,
    { projectId: 'p-ui-kit', status: 'Solved', upvotes: ['Dan Abramov', 'Theo Browne'], answers: [['Dan Abramov', 'Avoid the big-bang rewrite. Wrap pages one at a time (strangler pattern), add characterization tests first, and ship each slice to production.', 5, true], ['Theo Browne', 'Agree. Start with the highest-churn pages — that is where you recover the investment fastest.', 7, false]] }),
  prob(3, 'How to review pull requests faster without lowering quality?', 'PRs sit for days in our team. Reviews are either rushed or never done. Ideas?', ['Code review', 'Process'], 'Addy Osmani', 2, { upvotes: ['Sarah Drasner'] }),
  prob(4, 'Impostor syndrome as a junior: how do I ask questions without feeling stupid?', 'I am a fresher and afraid to ask "obvious" questions in the team chat.', ['Career', 'Mentorship'], 'Riya Sharma', 1, { upvotes: ['Cassidy Williams', 'Kent C. Dodds'], answers: [['Sarah Drasner', 'Share what you already tried when you ask. That turns it into a good question and people respond happily. Also write the answer into docs — you help the next person too.', 1, false]] }),
];
