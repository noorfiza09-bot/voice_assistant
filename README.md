# VoiceTask — Voice Controlled Personal Task Assistant

A voice-activated assistant for adding tasks, setting reminders, and checking
your schedule hands-free.

- **Frontend:** React (Vite) + the browser's Web Speech API
- **Backend:** Node.js + Express
- **Auth:** Email/password accounts with bcrypt + JWT sessions
- **AI:** OpenAI API for turning spoken sentences into structured actions
- **Database:** PostgreSQL — tasks are scoped per-user

```
voicetask/
├── backend/     Express API, OpenAI intent parsing, Postgres access
└── frontend/    React UI — voice orb, sidebar, task list
```

## 1. Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a connection string to a hosted instance)
- An OpenAI API key

## 2. Set up the database

Create an empty database:

```bash
createdb voicetask
```

## 3. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:
- `DATABASE_URL` — your Postgres connection string
- `OPENAI_API_KEY` — your OpenAI key
- `JWT_SECRET` — any long random string (e.g. run `openssl rand -hex 32`)

Then create the `tasks` table:

```bash
npm run db:setup
```

Start the API:

```bash
npm run dev
```

It runs on **http://localhost:4000**. Visit `/api/health` to confirm it's up.

## 4. Set up the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

It runs on **http://localhost:5173** and proxies `/api/*` requests to the
backend automatically (see `vite.config.js`), so you don't need to change
any URLs.

## 5. Use it

1. Open http://localhost:5173 in **Chrome or Edge** (Web Speech API support
   varies — Safari and Firefox are inconsistent).
2. Sign up with any email/password (8+ characters) — this creates your
   account and logs you in. Your tasks are private to your account.
3. Click the mic orb, allow microphone access, and say something like:
   - "Remind me to call mom tomorrow at 5pm"
   - "Add submit assignment to my day"
   - "Mark buy groceries as done"
   - "Delete call mom"
4. Or type a task into the text box under the orb instead of speaking —
   it's parsed by the same AI, so "remind me to call mom at 5pm" works
   whether you say it or type it.
5. Or click **+ Add a task** to add one manually with a form (title, due
   date, priority) instead of natural language.
6. Click **Enable reminders** in the sidebar to get a browser notification
   the moment a task's due time arrives, as long as this tab stays open.

## How reminders work

`useTaskNotifications` (frontend-only, no backend involved) watches your
task list. For every incomplete task with a `due_at`, it schedules a
`setTimeout` that fires a browser `Notification` at the exact due time, and
cancels that timer if you complete or delete the task first. This only
works while the VoiceTask tab is open — for reminders that fire even when
the tab or browser is closed, you'd need a service worker and push
subscriptions, which is a good "next step" if you want to extend this.

## How auth works

- `POST /api/auth/signup` hashes your password with bcrypt and stores a new
  row in `users`, then returns a JWT.
- `POST /api/auth/login` checks your password against the stored hash and
  returns a JWT.
- The frontend stores that JWT in `localStorage` and sends it as
  `Authorization: Bearer <token>` on every request.
- `middleware/auth.js` verifies the JWT on every `/api/tasks` and
  `/api/voice` request and attaches `req.userId`, so every query in
  `routes/tasks.js` and `routes/voice.js` is automatically scoped to
  `WHERE user_id = ...` — one user can never see or modify another's tasks.
- `GET /api/auth/me` lets the frontend double-check a stored token is still
  valid on page load, rather than trusting `localStorage` blindly.

## How the voice pipeline works

1. `useSpeechRecognition` (frontend) captures your speech and turns it into
   text using the browser's built-in `SpeechRecognition` API — no network
   call needed for this part.
2. The final transcript is POSTed to `/api/voice/parse` (with your auth
   token) on the backend.
3. `services/intentParser.js` sends that transcript to the OpenAI API with a
   system prompt that forces a structured JSON response: an `action`
   (create/complete/delete/query), a `title`, a `due_at`, etc.
4. `routes/voice.js` takes that structured intent and runs the matching SQL
   against Postgres, scoped to your `user_id` (insert, update, or delete a
   row in `tasks`).
5. The frontend refetches the task list and shows the AI's `reply` as the
   status message under the orb.

## Next steps / ideas to extend it

- Speak the AI's reply back out loud with the Web Speech `SpeechSynthesis` API
- Add a real calendar/week view backed by `due_at`
- Add "forgot password" / email verification if you make this public
- Deploy: frontend to Vercel/Netlify, backend to Render/Railway, DB to Neon/Supabase
