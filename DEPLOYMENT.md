# Deployment Guide

This guide explains how to run the Propel AI Smart Grid system from a fresh clone.

## 1. Prerequisites
- Docker & Docker Compose
- Node.js (v18+) (if running locally without Docker)
- Git

## 2. Zero-Config Startup (Docker Compose)

The easiest way to run the entire stack is via Docker.

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd <your-repo-name>

# 2. Build and start the containers
docker compose up --build
```
This single command spins up MongoDB, the Express Backend, and the Vite React Frontend. 
- Open `http://localhost:5173` to see the UI.
- The database is automatically seeded on startup.

## 3. Environment Variables

A `.env` file is provided in the root of the `backend` folder. If you deploy to a VPS or Render, configure these:

| Variable | Purpose | Required | Safe Default |
|----------|---------|----------|--------------|
| `PORT` | The port the backend runs on | No | `5000` |
| `MONGO_URI` | Connection string for MongoDB | No | `mongodb://localhost:27017/propel_ai` |
| `OPENAI_API_KEY` | API key for generating AI briefings | **Yes** | N/A |
| `NODE_ENV` | Environment mode | No | `development` |

## 4. Troubleshooting Guide

During development, you might encounter these failure modes:

### A. Blank Screen on Frontend (React Crash)
**Symptom:** Opening localhost:5173 shows a completely blank dark screen, and no UI renders.
**Cause:** Vite dynamic module importing or HMR cache failure.
**Fix:** Hard refresh the browser (Ctrl+F5). If it persists, delete the `.vite` cache folder in `frontend/node_modules/` and restart the dev server.

### B. "Cannot resolve ticket, poles are still dark" Error
**Symptom:** Clicking "Mark Resolved" on the frontend throws an error toaster.
**Cause:** The system prevents operators from closing tickets if the physical sensors still report `energized: false`.
**Fix:** Use the Fault Simulator to inject a `Status Update` with `True (Live)` for the affected poles first, then resolve.

### C. MongoDB Connection Timeout
**Symptom:** Backend logs show `MongoTimeoutError`.
**Cause:** Docker compose network delay, or local MongoDB service is not running.
**Fix:** Restart docker compose. The backend includes a robust retry mechanism, but if MongoDB is entirely down, ensure the daemon is active via `systemctl start mongod`.

## 5. Clean Reset

To wipe the database and start entirely fresh:

```bash
docker compose down -v
docker compose up --build
```
The `-v` flag deletes the MongoDB volume, and the backend will re-seed the initial pristine network on the next boot.
