import http from 'node:http';
import url from 'node:url';
import * as db from './db.js';

const PORT = process.env.PORT || 5000;

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

function sendError(res, statusCode, message, details = null) {
  sendJson(res, statusCode, { error: message, details });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function getAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return db.getUserByToken(token);
}

// Router handler to be used both in standalone HTTP server and in Vite connect middleware
export async function handleApiRequest(req, res) {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return true;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname || '';

  // Only handle /api paths
  if (!pathname.startsWith('/api')) {
    return false;
  }

  const apiPath = pathname.replace(/^\/api/, '');
  const method = req.method.toUpperCase();
  const authUser = getAuthUser(req);

  try {
    // ----------------------------------------------------
    // Health Check
    // ----------------------------------------------------
    if (apiPath === '/health' && method === 'GET') {
      sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
      return true;
    }

    // ----------------------------------------------------
    // Platform Stats
    // ----------------------------------------------------
    if (apiPath === '/stats' && method === 'GET') {
      sendJson(res, 200, db.getStats());
      return true;
    }

    // Reset Demo Data
    if (apiPath === '/reset' && method === 'POST') {
      db.resetToDemo();
      sendJson(res, 200, { message: 'Reset demo data successfully' });
      return true;
    }

    // ----------------------------------------------------
    // Authentication Routes
    // ----------------------------------------------------
    if (apiPath === '/auth/register' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.name || !body.email || !body.password) {
        sendError(res, 400, 'Name, email, and password are required.');
        return true;
      }
      if (body.password.length < 6) {
        sendError(res, 400, 'Password must be at least 6 characters.');
        return true;
      }

      try {
        const user = db.createUser(body);
        const token = db.createSession(user.id);
        sendJson(res, 201, { user, token, message: 'Account created successfully.' });
      } catch (err) {
        sendError(res, err.status || 400, err.message);
      }
      return true;
    }

    if (apiPath === '/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.email || !body.password) {
        sendError(res, 400, 'Email and password are required.');
        return true;
      }

      try {
        const user = db.authenticateUser(body.email, body.password);
        const token = db.createSession(user.id);
        sendJson(res, 200, { user, token, message: 'Logged in successfully.' });
      } catch (err) {
        sendError(res, err.status || 401, err.message);
      }
      return true;
    }

    if (apiPath === '/auth/me' && method === 'GET') {
      if (!authUser) {
        sendError(res, 401, 'Not authenticated or session expired.');
        return true;
      }
      sendJson(res, 200, { user: authUser });
      return true;
    }

    if (apiPath === '/auth/logout' && method === 'POST') {
      const token = req.headers.authorization?.replace(/^Bearer\s+/i, '').trim();
      if (token) db.removeSession(token);
      sendJson(res, 200, { message: 'Logged out successfully.' });
      return true;
    }

    if (apiPath === '/auth/users' && method === 'GET') {
      const users = db.getAllUsers();
      sendJson(res, 200, users);
      return true;
    }

    // ----------------------------------------------------
    // Projects Routes
    // ----------------------------------------------------
    // GET /api/projects
    if (apiPath === '/projects' && method === 'GET') {
      const { status, q, mine } = parsedUrl.query;
      const mineEmail = mine === 'true' && authUser ? authUser.email : null;
      const projects = db.getProjects({ status, q, mineEmail });
      sendJson(res, 200, projects);
      return true;
    }

    // POST /api/projects - Create New Project
    if (apiPath === '/projects' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.name || !body.tagline || !body.description) {
        sendError(res, 400, 'Project name, tagline, and description are required.');
        return true;
      }

      const creator = authUser || {
        name: body.creatorName || 'Anonymous',
        email: body.creatorEmail || '',
      };

      const project = db.createProject(body, creator);
      sendJson(res, 201, project);
      return true;
    }

    // Single Project match: /projects/:id
    const projectMatch = apiPath.match(/^\/projects\/([a-zA-Z0-9_-]+)$/);
    if (projectMatch) {
      const projectId = projectMatch[1];

      if (method === 'GET') {
        const project = db.getProjectById(projectId);
        if (!project) {
          sendError(res, 404, `Project with ID ${projectId} not found.`);
          return true;
        }
        sendJson(res, 200, project);
        return true;
      }

      if (method === 'PUT') {
        const body = await parseBody(req);
        const actor = authUser ? authUser.name : (body.actor || 'Project Lead');
        const updated = db.updateProject(projectId, body, actor);
        if (!updated) {
          sendError(res, 404, `Project with ID ${projectId} not found.`);
          return true;
        }
        sendJson(res, 200, updated);
        return true;
      }

      if (method === 'DELETE') {
        const deleted = db.deleteProject(projectId);
        if (!deleted) {
          sendError(res, 404, `Project with ID ${projectId} not found.`);
          return true;
        }
        sendJson(res, 200, { message: 'Project deleted successfully.', id: projectId });
        return true;
      }
    }

    // Project Tasks: /projects/:id/tasks
    const tasksMatch = apiPath.match(/^\/projects\/([a-zA-Z0-9_-]+)\/tasks$/);
    if (tasksMatch && method === 'POST') {
      const projectId = tasksMatch[1];
      const body = await parseBody(req);
      if (!body.title) {
        sendError(res, 400, 'Task title is required.');
        return true;
      }
      const actor = authUser ? authUser.name : (body.actor || 'Team member');
      const task = db.addProjectTask(projectId, body, actor);
      if (!task) {
        sendError(res, 404, `Project with ID ${projectId} not found.`);
        return true;
      }
      sendJson(res, 201, task);
      return true;
    }

    // Specific Project Task: /projects/:id/tasks/:taskId
    const taskItemMatch = apiPath.match(/^\/projects\/([a-zA-Z0-9_-]+)\/tasks\/([a-zA-Z0-9_-]+)$/);
    if (taskItemMatch) {
      const [, projectId, taskId] = taskItemMatch;
      const actor = authUser ? authUser.name : 'Team member';

      if (method === 'PATCH' || method === 'PUT') {
        const body = await parseBody(req);
        const updated = db.updateProjectTask(projectId, taskId, body, actor);
        if (!updated) {
          sendError(res, 404, 'Task or project not found.');
          return true;
        }
        sendJson(res, 200, updated);
        return true;
      }

      if (method === 'DELETE') {
        const deleted = db.deleteProjectTask(projectId, taskId, actor);
        if (!deleted) {
          sendError(res, 404, 'Task or project not found.');
          return true;
        }
        sendJson(res, 200, { message: 'Task deleted successfully.' });
        return true;
      }
    }

    // Project Members: /projects/:id/members
    const membersMatch = apiPath.match(/^\/projects\/([a-zA-Z0-9_-]+)\/members$/);
    if (membersMatch && method === 'POST') {
      const projectId = membersMatch[1];
      const body = await parseBody(req);
      const actor = authUser ? authUser.name : (body.actor || 'Project Lead');
      const updatedProject = db.addProjectMember(projectId, body, actor);
      if (!updatedProject) {
        sendError(res, 404, `Project with ID ${projectId} not found.`);
        return true;
      }
      sendJson(res, 200, updatedProject);
      return true;
    }

    // Project Member item: /projects/:id/members/:memberKey
    const memberItemMatch = apiPath.match(/^\/projects\/([a-zA-Z0-9_-]+)\/members\/([a-zA-Z0-9_.-]+)$/);
    if (memberItemMatch) {
      const [, projectId, memberKey] = memberItemMatch;
      const actor = authUser ? authUser.name : 'Project Lead';

      if (method === 'PATCH' || method === 'PUT') {
        const body = await parseBody(req);
        const updated = db.updateProjectMember(projectId, memberKey, body, actor);
        if (!updated) {
          sendError(res, 404, 'Member or project not found.');
          return true;
        }
        sendJson(res, 200, updated);
        return true;
      }

      if (method === 'DELETE') {
        const updated = db.removeProjectMember(projectId, memberKey, actor);
        if (!updated) {
          sendError(res, 404, 'Member or project not found.');
          return true;
        }
        sendJson(res, 200, updated);
        return true;
      }
    }

    // Project Join Requests: /projects/:id/requests
    const requestsMatch = apiPath.match(/^\/projects\/([a-zA-Z0-9_-]+)\/requests$/);
    if (requestsMatch && method === 'POST') {
      const projectId = requestsMatch[1];
      const body = await parseBody(req);
      const requestData = {
        name: authUser?.name || body.name,
        email: authUser?.email || body.email,
        message: body.message,
      };
      const reqRecord = db.addProjectRequest(projectId, requestData);
      if (!reqRecord) {
        sendError(res, 404, `Project with ID ${projectId} not found.`);
        return true;
      }
      sendJson(res, 201, reqRecord);
      return true;
    }

    // Project Discussions / Threads: /projects/:id/threads
    const threadsMatch = apiPath.match(/^\/projects\/([a-zA-Z0-9_-]+)\/threads$/);
    if (threadsMatch && method === 'POST') {
      const projectId = threadsMatch[1];
      const body = await parseBody(req);
      const actor = authUser ? authUser.name : (body.author || 'Team member');
      const thread = db.addProjectThread(projectId, body, actor);
      if (!thread) {
        sendError(res, 404, `Project with ID ${projectId} not found.`);
        return true;
      }
      sendJson(res, 201, thread);
      return true;
    }

    // Project Thread Reply: /projects/:id/threads/:threadId/replies
    const threadReplyMatch = apiPath.match(/^\/projects\/([a-zA-Z0-9_-]+)\/threads\/([a-zA-Z0-9_-]+)\/replies$/);
    if (threadReplyMatch && method === 'POST') {
      const [, projectId, threadId] = threadReplyMatch;
      const body = await parseBody(req);
      const actor = authUser ? authUser.name : (body.author || 'Contributor');
      const reply = db.replyProjectThread(projectId, threadId, body, actor);
      if (!reply) {
        sendError(res, 404, 'Thread or project not found.');
        return true;
      }
      sendJson(res, 201, reply);
      return true;
    }

    // Project Thread Upvote: /projects/:id/threads/:threadId/upvote
    const threadUpvoteMatch = apiPath.match(/^\/projects\/([a-zA-Z0-9_-]+)\/threads\/([a-zA-Z0-9_-]+)\/upvote$/);
    if (threadUpvoteMatch && method === 'POST') {
      const [, projectId, threadId] = threadUpvoteMatch;
      const voter = authUser ? authUser.name : 'Anonymous';
      const thread = db.upvoteProjectThread(projectId, threadId, voter);
      if (!thread) {
        sendError(res, 404, 'Thread or project not found.');
        return true;
      }
      sendJson(res, 200, thread);
      return true;
    }

    // Project Milestones: /projects/:id/milestones
    const milestonesMatch = apiPath.match(/^\/projects\/([a-zA-Z0-9_-]+)\/milestones$/);
    if (milestonesMatch && (method === 'PUT' || method === 'POST')) {
      const projectId = milestonesMatch[1];
      const body = await parseBody(req);
      const actor = authUser ? authUser.name : 'Project Lead';
      const milestones = db.updateProjectMilestones(projectId, body.milestones || body, actor);
      if (!milestones) {
        sendError(res, 404, `Project with ID ${projectId} not found.`);
        return true;
      }
      sendJson(res, 200, milestones);
      return true;
    }

    // ----------------------------------------------------
    // Community Problems
    // ----------------------------------------------------
    if (apiPath === '/problems' && method === 'GET') {
      const { status, tag, q, sort } = parsedUrl.query;
      const problems = db.getProblems({ status, tag, q, sort });
      sendJson(res, 200, problems);
      return true;
    }

    if (apiPath === '/problems' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.title || !body.body) {
        sendError(res, 400, 'Title and body are required.');
        return true;
      }
      const problem = db.createProblem(body, authUser);
      sendJson(res, 201, problem);
      return true;
    }

    const problemMatch = apiPath.match(/^\/problems\/([a-zA-Z0-9_-]+)$/);
    if (problemMatch && method === 'GET') {
      const problem = db.getProblemById(problemMatch[1]);
      if (!problem) {
        sendError(res, 404, 'Problem not found.');
        return true;
      }
      sendJson(res, 200, problem);
      return true;
    }

    const answerMatch = apiPath.match(/^\/problems\/([a-zA-Z0-9_-]+)\/answers$/);
    if (answerMatch && method === 'POST') {
      const problemId = answerMatch[1];
      const body = await parseBody(req);
      if (!body.body) {
        sendError(res, 400, 'Answer body is required.');
        return true;
      }
      const answer = db.addProblemAnswer(problemId, body, authUser);
      if (!answer) {
        sendError(res, 404, 'Problem not found.');
        return true;
      }
      sendJson(res, 201, answer);
      return true;
    }

    const upvoteMatch = apiPath.match(/^\/problems\/([a-zA-Z0-9_-]+)\/upvote$/);
    if (upvoteMatch && method === 'POST') {
      const problemId = upvoteMatch[1];
      const userName = authUser ? authUser.name : 'Anonymous';
      const problem = db.upvoteProblem(problemId, userName);
      if (!problem) {
        sendError(res, 404, 'Problem not found.');
        return true;
      }
      sendJson(res, 200, problem);
      return true;
    }

    const solveMatch = apiPath.match(/^\/problems\/([a-zA-Z0-9_-]+)\/answers\/([a-zA-Z0-9_-]+)\/solve$/);
    if (solveMatch && method === 'PATCH') {
      const [, problemId, answerId] = solveMatch;
      const problem = db.markProblemSolution(problemId, answerId);
      if (!problem) {
        sendError(res, 404, 'Problem not found.');
        return true;
      }
      sendJson(res, 200, problem);
      return true;
    }

    // ----------------------------------------------------
    // Posts
    // ----------------------------------------------------
    if (apiPath === '/posts' && method === 'GET') {
      const loaded = db.loadDb();
      sendJson(res, 200, loaded.posts || []);
      return true;
    }

    if (apiPath === '/posts' && method === 'POST') {
      const body = await parseBody(req);
      const loaded = db.loadDb();
      const newPost = {
        id: `post-${Date.now()}`,
        userId: body.userId || authUser?.id || 1,
        title: body.title,
        body: body.body,
        createdAt: new Date().toISOString(),
      };
      if (!loaded.posts) loaded.posts = [];
      loaded.posts.unshift(newPost);
      db.saveDb(loaded);
      sendJson(res, 201, newPost);
      return true;
    }

    // Unmatched API route
    sendError(res, 404, `Endpoint ${method} /api${apiPath} not found.`);
    return true;
  } catch (err) {
    console.error('API Error:', err);
    sendError(res, 500, 'Internal Server Error', err.message);
    return true;
  }
}

// Create standalone HTTP server if run directly
const server = http.createServer(async (req, res) => {
  const handled = await handleApiRequest(req, res);
  if (!handled) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found. Use /api routes.' }));
  }
});

// If executed via `node server/server.js`, start listening
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  server.listen(PORT, () => {
    console.log(`\n🚀 DevDirectory Backend Server running on http://localhost:${PORT}`);
    console.log(`📡 API Endpoints available at http://localhost:${PORT}/api`);
    console.log(`💾 Persistent database at server/data/db.json\n`);
  });
}

export default server;
