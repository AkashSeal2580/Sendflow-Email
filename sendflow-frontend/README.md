# SendFlow Frontend

A React + TypeScript + Vite + Tailwind frontend starter for the ReachInbox email scheduler assignment.

## Run locally
1. Install Node.js 20+.
2. Open this folder in VS Code.
3. Run `npm install`
4. Run `npm run dev`
5. Open the local URL printed by Vite.

## Included screens
- Login (Google OAuth button placeholder)
- Dashboard
- Scheduled Emails
- Sent Emails
- Compose Campaign with CSV upload preview and scheduling settings
- Sender Management
- Queue Monitor
- Settings

## Important
This is the **frontend starter**. It currently uses sample/mock data so you can run and review the UI before the backend is ready.
- API base URL is configured through `VITE_API_BASE_URL`.
- Google OAuth, campaign creation, sender persistence, Slack OAuth, and live queue data must be connected to your Express backend.
- The queue page contains a placeholder for Bull Board. Mount Bull Board on your backend and link/embed its protected route as appropriate.
- Do not put OAuth client secrets or SMTP credentials in frontend environment variables.

## Suggested backend API contract
- `GET /auth/me`
- `GET /emails?status=scheduled`
- `GET /emails?status=sent`
- `POST /campaigns` (multipart/form-data for CSV)
- `GET /senders`, `POST /senders`
- `GET /queue/summary`
- `GET /integrations/slack`
