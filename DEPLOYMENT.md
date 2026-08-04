# Deployment

This guide explains how to deploy the Propel AI Smart Grid Fault Localization System.

## Prerequisites
- **Docker** and **Docker Compose** installed.
- Git.

## Quick Start (Single Command)
To bring up the entire stack (Database, Backend, Frontend), run:
```bash
git clone <your-repo-url>
cd Propel-Ai-Assignment
docker compose up --build
```

## Environment Variables
The system uses reasonable defaults so it can run out of the box, but you can configure the following in the `docker-compose.yml` or a `.env` file:
- `MONGO_URI`: Connection string for MongoDB. (Default: `mongodb://mongodb:27017/propel_ai`)
- `PORT`: Backend API port. (Default: `5000`)

## Verifying Deployment
1. **Frontend**: Open `http://localhost:80` in your browser. You should see the operator dashboard.
2. **Backend**: Open `http://localhost:5000/`. You should see "API is running...".
3. **Graph Data**: Open `http://localhost:5000/graph` to verify that the topology was seeded successfully.

## Troubleshooting
- **Port Conflicts**: If port 80 or 5000 is already in use on your host machine, edit `docker-compose.yml` to map to different host ports (e.g., `"8080:80"` or `"5001:5000"`).
- **Empty Database/No Graph**: If the app starts but the map is empty, ensure the backend logs show "Inserted 9 Poles...". If not, you can restart the backend container or clear the mongo volume (`docker compose down -v` and then `up` again).
- **Vite/Frontend not updating**: Since it's a production build inside Docker, any code changes require running `docker compose up --build` to rebuild the frontend image.

## Resetting State
To wipe all data and start fresh:
```bash
docker compose down -v
docker compose up --build
```
