# Propel AI - Smart Grid Fault Localization System

![Smart Grid](https://img.shields.io/badge/Domain-Smart%20Grid-success)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green)
![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-blue)
![ReactRouter](https://img.shields.io/badge/Router-React%20Router%20DOM-CA4245)
![Axios](https://img.shields.io/badge/HTTP-Axios-5A29E4)

Welcome to the **Smart Grid Fault Localization System**. This system is built to ingest massive streams of IoT telemetry data from distribution poles, instantly localize power faults using Graph Theory, and automatically generate support tickets with offline reverse geocoding.

## 🔗 Important Links

* **Live Public URL:** [INSERT_YOUR_DEPLOYED_URL_HERE] *(Hosted on Vercel/Render)*
* **5-Minute Demo Video:** [INSERT_YOUR_VIDEO_LINK_HERE] *(Loom / YouTube Unlisted)*

---

## 📖 Documentation Map

To understand how this system was built and how it operates, please read the following documents in order:

1. [ARCHITECTURE.md](./ARCHITECTURE.md) - The technical heart of the system. Explains the graph algorithms, MST topology inference, and data ingestion pipeline.
2. [DEPLOYMENT.md](./DEPLOYMENT.md) - Exact copy-paste commands to deploy and run this stack locally or on a server, including a detailed troubleshooting guide.
3. [DECISIONS.md](./DECISIONS.md) - A log of architectural trade-offs, rejected approaches, and assumptions made during development.
4. [AI-WORKFLOW.md](./AI-WORKFLOW.md) - An honest breakdown of how AI was used, where it failed, and how the codebase was co-authored.

---

## 🚀 One-Command Start (Docker)

To bring up the entire stack (Backend, Frontend, and MongoDB) instantly without configuring anything manually:

```bash
git clone <your-repo-url>
cd <your-repo-name>
docker compose up --build
```

**What happens next?**
1. MongoDB starts on port 27017.
2. The Backend API starts on port 5000 and **automatically seeds** the database with a synthetic network topology.
3. The Frontend Vite app starts on port 5173.
4. Open `http://localhost:5173` in your browser. You will see a live working system with an interactive Fault Simulator.

---

## ⚡ Quick Test Guide

Once the app is running, use the **Fault Simulator** on the right side of the Dashboard:

1. **Inject a Span Fault:** Select Event `Power Lost`, Status `Dark`, Pole `P6`, and click Inject. You will instantly see a Span Fault ticket appear on the left.
2. **Test Noise (Dead Sensor):** Select Pole `P2` and `Power Lost`. Notice that no ticket is generated, but the pole turns Orange (Dead Sensor) on the map, because its downstream nodes are still live.
3. **Test Scheduled Outage:** Select Event `Scheduled Outage`. No fault ticket will be generated.
4. **Auto-Verify Repair:** Select Event `Status Update`, Status `Live` for `P6`. The open fault ticket will automatically resolve.

---
*Built for the Propel AI Technical Assessment.*
