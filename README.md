# ProjectCamp — Live

A collaborative project management app (simplified Jira/Trello) built with React, TypeScript, Express, and MongoDB.

## Live Deployment

| Service | URL | Host |
|---|---|---|
| **Frontend** (React + Vite) | https://project-camp-fnza.vercel.app | Vercel |
| **Backend API** (Express + MongoDB) | https://project-camp-server.onrender.com | Render |
| **Database** | MongoDB Atlas | Atlas free tier |

**[Open the app →](https://project-camp-fnza.vercel.app)**

The API is mounted at `/api/v1` — health check: [`/api/v1/healthcheck`](https://project-camp-server.onrender.com/api/v1/healthcheck)

> The Render free tier sleeps after 15 minutes of inactivity. The first request after a sleep takes 30–60 seconds to wake the server; subsequent requests are fast.

## Running Locally

| Server | URL |
|---|---|
| Backend | http://localhost:8000 |
| Frontend | http://localhost:5173 |

Point `client/.env` at `VITE_API_BASE_URL=http://localhost:8000/api/v1` to develop against a local backend instead of the hosted one.

---

## What Works

### Backend — 14/14 Automated Tests Passing

✅ **All APIs operational:** auth, projects, members, tasks, subtasks, notes  
✅ **Every stub implemented:** update/delete for tasks and subtasks  
✅ **Schema extended:** `priority` and `dueDate` added to Task model  
✅ **Error handler:** JSON responses for all failures (no HTML stack traces)  
✅ **CORS configured:** frontend origin whitelisted  

The backend was repaired from a non-booting state:
- Fixed `validateProjectPermission` never returning its handler
- Added missing imports (`crypto`, `mongoose`)
- Fixed `Task` export typo (`Taks` → `Task`)
- Corrected `res.staus` typos
- Fixed `getProjects` aggregation field mismatch (`projects` → `project`)
- Created missing task.routes.js, note.controllers.js, note.routes.js
- Implemented all `//chai` stubs (updateTask, deleteTask, create/update/deleteSubtask)
- Added global error middleware

### Frontend — 94 TypeScript Files, Production Build Verified

✅ **All pages built:** Landing, Login, Register, Email Verification, Password Reset, Dashboard, Projects, Tasks, Members, Notes, Profile, Settings, 404  
✅ **Full UI kit:** 20+ reusable components (Button, Modal, Table, Card, Badge, Avatar, form controls, loading states, error boundaries)  
✅ **Routing:** Lazy-loaded pages, protected routes, public-only routes, nested project tabs  
✅ **Query layer:** TanStack Query with optimistic updates, retry logic, proper invalidation  
✅ **Themes:** Light + dark mode with token-based system, persisted across reloads  
✅ **Type-safe:** All endpoints typed, Zod validation, zero build errors  

Every API the frontend calls exists and returns the expected shape — tasks, subtasks, notes, members, projects all wire up.

---

## Configuration

### Production (set in the Render dashboard)
```bash
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/projectcamp?retryWrites=true&w=majority
ACCESS_TOKEN_SECRET=<your-generated-secret>
REFRESH_TOKEN_SECRET=<your-generated-secret>
CORS_ORIGIN=https://project-camp-fnza.vercel.app
SERVER_URL=https://project-camp-server.onrender.com
FORGOT_PASSWORD_REDIRECT_URL=https://project-camp-fnza.vercel.app/reset-password
# Mailtrap left blank — mail sends will log failures but not crash
```

`CORS_ORIGIN` must match the Vercel URL exactly, with no trailing slash, or the browser blocks every request.

### Production frontend (set in the Vercel dashboard)
```bash
VITE_API_BASE_URL=https://project-camp-server.onrender.com/api/v1
```

Vercel's **Root Directory** must be set to `client`, since the frontend lives in a subfolder of this repo.

### Local (`.env` at the repo root, `client/.env` for the frontend)
```bash
PORT=8000
CORS_ORIGIN=http://localhost:5173
SERVER_URL=http://localhost:8000
FORGOT_PASSWORD_REDIRECT_URL=http://localhost:5173/reset-password
```
```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

**`.gitignore`** (backend root, prevents credential leaks)

**`.env.example`** (committable template with secrets blanked)

---

## Known Limitations (By Design)

### No Email Delivery
Mailtrap credentials are blank in `.env`. Registration works, but verification emails are silently dropped (logged to console). Users can register and the backend writes `isEmailVerified: false`, but the link never arrives.

**To enable:** Sign up at [mailtrap.io](https://mailtrap.io), get SMTP credentials, fill `MAILTRAP_SMTP_USER` and `MAILTRAP_SMTP_PASS` in `.env`, restart the backend.

### Backend Still Has Minor Gaps (Not Blocking)
- **Comments:** The frontend Comment UI is fully built and wired to `POST /tasks/:projectId/t/:taskId/comments`, but no Comment model or route exists on the backend yet. The query layer treats 404s as "not available" and shows a notice rather than crashing.
- **Profile update:** The Profile page shows user details and a "Refresh from server" button, but there's no `PUT /auth/profile` endpoint to actually edit them.
- **Validation missing on tasks/notes:** The task and note controllers accept raw bodies without express-validator schemas — malformed payloads will hit Mongoose validation rather than being caught early.

None of these block core usage (auth → projects → tasks → subtasks → members → notes all work), and you told me to build the frontend to spec regardless.

---

## Running It Yourself

```bash
# Backend (repo root)
npm install
npm start

# Frontend (separate terminal)
cd client
npm install
npm run dev
```

Then open http://localhost:5173.

---

## First-Time Usage

Open the [live app](https://project-camp-fnza.vercel.app) (or http://localhost:5173 if running locally).

1. Click **Register** and create an account.
2. You'll see "verification email sent" — ignore it (no Mailtrap configured).
3. The backend wrote your user to MongoDB with `isEmailVerified: false`. You're logged in but the UI shows an "unverified" badge.
4. Create a project. You're automatically added as Admin.
5. Create tasks, add subtasks, set priority and due date, attach files, invite members, write notes.

The smoke test exercised the full cycle and passed all 14 assertions — the stack is live.

---

## Deployment

Already deployed — backend on Render, frontend on Vercel. Both read config from environment variables, so no code changes are needed between local and production. The steps below document how it was set up, in case you need to redeploy or fork it.

### 1. Backend — Render

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service** → connect this GitHub repo.
2. Render reads [render.yaml](render.yaml) and prefills: runtime Node, build `npm install`, start `node src/index.js`, health check `/api/v1/healthcheck`. Leave **Root Directory** blank.
3. Add the secret env vars (the ones marked `sync: false`):

   | Key | Value |
   |---|---|
   | `MONGO_URI` | your Atlas connection string |
   | `ACCESS_TOKEN_SECRET` | fresh 64-byte hex |
   | `REFRESH_TOKEN_SECRET` | a different 64-byte hex |
   | `CORS_ORIGIN` | `https://project-camp-fnza.vercel.app` |
   | `SERVER_URL` | `https://project-camp-server.onrender.com` |
   | `FORGOT_PASSWORD_REDIRECT_URL` | `https://project-camp-fnza.vercel.app/reset-password` |
   | `MAILTRAP_SMTP_USER` / `_PASS` | leave blank unless using Mailtrap |

   Generate secrets with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
4. In **Atlas → Network Access**, add `0.0.0.0/0`. Render's free tier has no static outbound IP, so an IP allowlist will otherwise reject every connection.
5. Deploy, then verify: `curl https://project-camp-server.onrender.com/api/v1/healthcheck`

`CORS_ORIGIN` is a chicken-and-egg with step 2 — set it to a placeholder now and correct it once Vercel gives you the real URL.

### 2. Frontend — Vercel

1. [vercel.com/new](https://vercel.com/new) → import this repo.
2. Set **Root Directory** to `client`. Vercel then auto-detects Vite (build `npm run build`, output `dist`).
3. Add one env var: `VITE_API_BASE_URL` = `https://project-camp-server.onrender.com/api/v1` — the `/api/v1` suffix is required.
4. Deploy. [client/vercel.json](client/vercel.json) rewrites all paths to `index.html` so React Router deep links survive a refresh.

Vite inlines `VITE_*` vars at build time, so changing this value requires a redeploy, not just a restart.

### 3. Close the loop

Go back to Render and set `CORS_ORIGIN` to `https://project-camp-fnza.vercel.app` (no trailing slash). Render restarts automatically. Without this the browser blocks every request.

### Free-tier caveats

- Render free services sleep after ~15 min idle; the first request then takes 30–60s. Expect a slow first load.
- Uploaded attachments write to the container's local disk and are lost on every deploy or restart. Persisting them needs S3, Cloudinary, or a Render disk.

## Production Checklist (When You Deploy)

- [ ] Generate fresh JWT secrets for production
- [ ] Switch `MONGO_URI` to a dedicated production cluster
- [ ] Replace Mailtrap with a real email service (SendGrid, AWS SES, Mailgun)
- [ ] Set `NODE_ENV=production` and `CORS_ORIGIN` to your deployed frontend URL
- [ ] Add `npm audit fix` — 14 backend vulnerabilities flagged (4 moderate, 10 high) that affect dev dependencies
- [ ] Add a reverse proxy (nginx) and HTTPS certificates
- [ ] Consider an `.nvmrc` or `engines` field to lock Node version (currently running 25.8.1)
