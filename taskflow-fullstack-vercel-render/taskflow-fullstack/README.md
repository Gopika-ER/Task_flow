# TaskFlow — Full-Stack Task Manager

React + Vite frontend, Node.js + Express backend. Designed for local learning and deployment to Vercel (frontend) + Render (backend).

## Requirements
- Node.js 20+ recommended
- Git and a GitHub account for deployment

## Run locally

### 1. Backend
Open a terminal:
```bash
cd backend
npm install
npm run dev
```
API runs at http://localhost:5000
Health check: http://localhost:5000/api/health

### 2. Frontend
Open a second terminal:
```bash
cd frontend
npm install
```
Create `frontend/.env` with:
```env
VITE_API_URL=http://localhost:5000
```
Then:
```bash
npm run dev
```
Open the local URL printed by Vite (usually http://localhost:5173).

## Deploy backend to Render
1. Push this project to a GitHub repository.
2. In Render, choose **New + → Web Service** and connect the repository.
3. Set **Root Directory** to `backend`.
4. Build command: `npm install`
5. Start command: `npm start`
6. Choose the Free instance if suitable for a demo.
7. After deployment, copy the Render service URL, e.g. `https://your-service.onrender.com`.
8. Test `https://your-service.onrender.com/api/health`.

## Deploy frontend to Vercel
1. In Vercel, import the same GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Framework preset: Vite (usually auto-detected).
4. Build command: `npm run build`; output directory: `dist`.
5. Add environment variable:
   `VITE_API_URL` = your Render service URL, with no trailing slash.
6. Deploy, then open the Vercel URL.

## Important demo limitation
This starter stores tasks in server memory, so tasks reset whenever the backend restarts/redeploys or spins down. It is for learning and demo use, not production. For persistent data, connect MongoDB Atlas or a managed database before using it as a real application.

## API endpoints
- `GET /api/health` — service status
- `GET /api/tasks` — list tasks
- `POST /api/tasks` — create task `{ "title": "Example task" }`
- `PATCH /api/tasks/:id` — toggle completion
- `DELETE /api/tasks/:id` — delete task
