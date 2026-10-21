# DevDirectory — Modern Developer Discovery & Project Collaboration Workspace

A modern developer discovery directory and collaborative project tracking platform built with **React**, **Vite**, and a **Node.js REST backend**. Browse curated developer profiles, authenticate with real user accounts, launch and track new projects, manage team task boards, and solve real-world engineering challenges collaboratively.

---

## ✨ What's New & Fixed

### 1. Complete Authentication System (Login & Sign Up)
- **Real Sign Up Page (`/signup`)**:
  - Full registration workflow with input validation: Full Name, Email, Username, Password (with minimum length and match validation), Professional Role, and Primary Skills.
  - Generates secure cryptographic salt and hashes passwords using PBKDF2 (`crypto.pbkdf2Sync`).
  - Auto-logs in on successful registration and navigates to workspaces.
- **Enhanced Login Page (`/login`)**:
  - Replaced the mock/simulated login with real backend credential verification.
  - Added password input with show/hide password toggle.
  - Clear error alerts for incorrect credentials or unregistered emails.
  - Quick demo account selector for instant one-click testing (`asha@company.dev`, `sarah@devdirectory.dev`, `dan@example.dev` with password `password123`).
  - Smooth redirects to originally requested protected pages.
- **Enhanced Navigation (`Navbar`)**:
  - Added "Sign up" button alongside "Log in".
  - Displays authenticated user avatar with initials, full name, and direct shortcut to start new projects.
  - Secure session logout with token revocation.

### 2. Robust Backend & Project Tracking System
- **Dedicated Backend Architecture (`server/`)**:
  - Built with native Node.js (`http`, `crypto`, `fs`, `path`) — **zero external dependencies** required.
  - Persistent, atomic JSON database (`server/data/db.json`) ensuring data durability across server restarts.
  - Full REST API with CORS headers and Bearer token authentication.
- **Comprehensive Project Tracking**:
  - **All new projects created in the future are fully tracked and persisted in the backend database**.
  - Tracks project metadata: unique ID, title, tagline, description, category tags, repository link, live demo URL, creator/lead identity, creation timestamp, and last updated timestamp.
  - **Task Board Tracking**: Kanban tracking across `To do`, `In progress`, `In review`, and `Done` states with priority tags (`Low`, `Medium`, `High`, `Critical`), assignees, due dates, and blocker flag tracking.
  - **Team Collaboration**: Tracks project leads, contributors, role assignments, and member join requests.
  - **Milestone Tracking**: Project roadmaps with due dates and completion checkoffs.
  - **Discussion Threads**: Announcements, decisions, questions, and discussions with upvotes, pinning, and nested reply threads.
  - **Audit Activity Feed**: Automatically records a historical timeline of all project events (creation, member additions, task movements, blockers, and comments).
  - **Community Problem Board**: Real developer Q&A linked directly to collaborative projects.

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+ recommended)
- npm

### 1. Quick Start (Frontend + Backend in One Command)
Run the Vite development server. It includes an embedded API middleware plugin that automatically powers all `/api/*` endpoints with the persistent database:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Running the Standalone Backend Server (Optional)
If you want to run the backend as a dedicated standalone HTTP service on port `5000`:

```bash
npm run server
```

The REST API will be available at:
- `http://localhost:5000/api/health`
- `http://localhost:5000/api/stats`
- `http://localhost:5000/api/projects`
- `http://localhost:5000/api/auth/login`
- `http://localhost:5000/api/auth/register`

---

## 🔑 Demo Accounts

You can register your own account via `/signup`, or test with these pre-seeded demo accounts:

| Name | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Asha Verma** | `asha@company.dev` | `password123` | Full Stack Engineer (Project Lead) |
| **Sarah Drasner** | `sarah@devdirectory.dev` | `password123` | Engineering Leader (UI Kit Lead) |
| **Dan Abramov** | `dan@example.dev` | `password123` | React Alumnus (Core Developer) |
| **Kent C. Dodds** | `hello@example.dev` | `password123` | Testing Playbook Lead |

---

## 📁 Project Structure

```text
devdirectory/
├── server/                    # Backend architecture
│   ├── server.js              # Standalone HTTP REST API server & router
│   ├── db.js                  # Persistent database engine with atomic file writes
│   ├── seedData.js            # Initial seed users, projects, and problems
│   └── data/
│       └── db.json            # Persistent JSON database (auto-created & updated)
├── src/                       # Frontend React application
│   ├── components/            # Reusable UI components (Navbar, UserCard, Workspace tabs)
│   ├── context/
│   │   ├── AuthContext.jsx    # Authentication state, login, signup, session verification
│   │   └── WorkspaceContext.jsx # Project tracking synchronization with backend
│   ├── pages/
│   │   ├── Home.jsx           # Landing page with makers and active projects
│   │   ├── Login.jsx          # Secure login page with demo autofill
│   │   ├── Signup.jsx         # New user registration page
│   │   ├── Projects.jsx       # Tracked projects catalog with search & filters
│   │   ├── NewProject.jsx     # Project creation form with tracking metadata
│   │   ├── ProjectDetail.jsx  # Workspace: overview, tasks, team, discussions, activity
│   │   ├── Community.jsx      # Community Q&A problem solving board
│   │   └── UserDirectory.jsx  # Curated developer profiles
│   ├── services/
│   │   ├── api.js             # Axios client with auth interceptors
│   │   ├── authService.js     # Auth API client
│   │   ├── projectService.js  # Project, task, and discussion API client
│   │   └── postService.js     # Developer posts client
│   ├── App.jsx                # Application routes
│   └── main.jsx               # React entrypoint
├── package.json               # Scripts & dependencies
└── vite.config.js             # Vite configuration with integrated backend API middleware
```

---

## 🛠️ REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Register a new developer account |
| `/api/auth/login` | `POST` | Authenticate and obtain session token |
| `/api/auth/me` | `GET` | Get current authenticated user profile |
| `/api/auth/logout` | `POST` | Invalidate active user session |
| `/api/auth/users` | `GET` | List registered developers |
| `/api/projects` | `GET` | List all tracked projects (supports `?status=...&q=...&mine=...`) |
| `/api/projects` | `POST` | Create and track a new project |
| `/api/projects/:id` | `GET` | Get detailed project data (tasks, team, activity) |
| `/api/projects/:id` | `PUT` | Update project metadata or status |
| `/api/projects/:id` | `DELETE` | Delete a project |
| `/api/projects/:id/tasks` | `POST` | Add a new task to the project board |
| `/api/projects/:id/tasks/:taskId` | `PATCH` | Update task status, priority, assignee, or blocker |
| `/api/projects/:id/tasks/:taskId` | `DELETE` | Remove a task |
| `/api/projects/:id/members` | `POST` | Add member or approve join request |
| `/api/projects/:id/threads` | `POST` | Create a discussion thread |
| `/api/projects/:id/threads/:tId/replies` | `POST` | Reply to a discussion thread |
| `/api/stats` | `GET` | Platform-wide metrics (projects, tasks, collaborators) |
| `/api/reset` | `POST` | Reset database to seed demo data |
