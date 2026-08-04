# Decisions Log

## 1. Using Docker Compose for Full-Stack Orchestration
- **Decision**: Implemented a multi-container Docker setup using `docker-compose.yml`.
- **Rejected**: Running services manually via Node/Vite, or using a cloud PaaS for the single-command requirement.
- **Why**: The prompt explicitly requested a single `docker compose up` command that brings up everything without manual intervention. Docker ensures environment consistency.

## 2. Inferring Topology with Haversine & MST
- **Decision**: Used Haversine formula + Minimum Spanning Tree to guess connections for the 60% of poles missing sequence data.
- **Rejected**: Assuming straight-line connections without weights, or prompting user for missing data.
- **Why**: A Minimum Spanning Tree naturally mimics how physical utility wires are run (minimizing total wire length). It provides the most mathematically sound guess for missing connections.

## 3. MongoDB for Storage
- **Decision**: Used MongoDB (NoSQL) for storing tickets, poles, and telemetries.
- **Rejected**: PostgreSQL / Relational databases.
- **Why**: Telemetry payloads can evolve. MongoDB's flexible schema handles varying IoT payload structures better and allows rapid iteration.

## 4. Frontend Served via Nginx in Docker
- **Decision**: Used a multi-stage Docker build for the frontend, compiling Vite to static assets and serving via Nginx.
- **Rejected**: Running `vite dev` server in production/Docker.
- **Why**: Nginx is lightweight and accurately simulates a real production deployment of a static SPA.

## What's Fragile / Future Work (Given 2 more weeks)
- **Database Indexing**: The telemetry ingestion endpoint could become a bottleneck under extreme load. I would implement a Redis caching layer or Apache Kafka for message queuing before hitting MongoDB.
- **Graph Scalability**: Currently, the adjacency list is built in-memory on backend startup. For a nationwide grid, we would need a dedicated graph database like Neo4j.
