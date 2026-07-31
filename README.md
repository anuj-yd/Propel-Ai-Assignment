# Propel AI - Smart Grid Fault Localization System

![Smart Grid](https://img.shields.io/badge/Domain-Smart%20Grid-success)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-blue)
![Architecture](https://img.shields.io/badge/Architecture-SOLID%20Principles-purple)

Welcome to the **Smart Grid Fault Localization System** built for Propel AI. This system is designed to ingest massive streams of IoT telemetry data from distribution poles, instantly localize power faults using Graph Theory, and automatically generate support tickets with offline reverse geocoding.

---

## 🌟 Key Features

1. **High-Volume Telemetry Ingestion**
   - Handles out-of-order messages and drops duplicate sequences.
   - Designed to process 30,000 requests per minute with strict schema validation.
2. **Graph-Based Fault Localization**
   - Automatically builds an adjacency list of the grid's topology.
   - Detects the exact edge boundary of a fault (e.g., between P2 and P3).
   - Filters out false positives (e.g., dead sensors).
3. **Missing Topology Inference (60% Problem Solved)**
   - Automatically infers missing wire connections between poles using the **Haversine Formula** and **Minimum Spanning Tree (MST)** algorithms.
4. **Automated Ticketing with Graceful Geocoding**
   - Automatically reverse-geocodes pole coordinates (Lat/Lng) to real-world PIN codes using OpenStreetMap.
   - Implements graceful offline degradation in case of network or proxy failures.
5. **Real-Time Websocket Alerts**
   - Instantly notifies the frontend of newly generated fault tickets.

---

## 🏗️ Architecture & SOLID Principles

This backend is strictly built adhering to **SOLID Principles** for enterprise-grade scalability:

* **Single Responsibility (SRP):** Complete separation of concerns (Controllers, Services, Repositories).
* **Open/Closed (OCP):** Fault detection is built using the **Strategy Pattern** (`SpanDetector`, `FeederDetector`, `DTDetector`), allowing new fault types to be added without modifying core logic.
* **Liskov Substitution (LSP):** All detector strategies implement a uniform `detect()` interface.
* **Dependency Inversion (DIP):** Controllers depend purely on abstractions (Services), ensuring the database layer can be swapped out easily.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Running on `localhost:27017` or via `MONGO_URI`)

### Backend Setup

1. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
   *The server will automatically connect to MongoDB, seed the initial topology data (including missing sequence poles), infer the MST graph, and start listening on port 5000.*

---

## 🧪 Testing the APIs

You can test the fault detection by sending POST requests to the `/telemetry` endpoint.

**1. Create a simulated fault (e.g., Pole P9 loses power):**
```bash
curl -X POST http://localhost:5000/telemetry \
-H "Content-Type: application/json" \
-d '{"device_id":"KSPDB-P9", "pole_id":"P9", "event":"power_lost", "energized":false, "ts":"2026-07-29T03:00:00.000Z", "seq":600}'
```

**2. Trigger the boundary localization (e.g., Pole P8 loses power):**
```bash
curl -X POST http://localhost:5000/telemetry \
-H "Content-Type: application/json" \
-d '{"device_id":"KSPDB-P8", "pole_id":"P8", "event":"power_lost", "energized":false, "ts":"2026-07-29T03:00:05.000Z", "seq":601}'
```
*The server will automatically detect the boundary between P7 and P8, geocode the location, and generate a ticket.*

**3. View Generated Tickets:**
```bash
curl http://localhost:5000/tickets
```

---

## 👨‍💻 Author
Built as part of the Propel AI Technical Assessment. 🚀
