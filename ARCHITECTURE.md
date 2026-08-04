# Architecture

## Overview
The Smart Grid Fault Localization System is built with a decoupled client-server architecture. It ingests massive telemetry streams, localizes faults using graph theory, and pushes real-time updates to the dashboard.

## Data Flow
1. **Telemetry Ingestion**: IoT devices send telemetry events (e.g., `power_lost`) to the `/telemetry` POST endpoint.
2. **Processing & Debouncing**: The backend validates the schema, drops duplicates/out-of-order messages, and ignores dead sensor noise.
3. **Fault Localization**: The system uses a Graph traversal algorithm to pinpoint the exact boundary of the fault.
4. **Geocoding & Ticketing**: Fault boundaries are reverse-geocoded to a PIN code. A Ticket is generated in MongoDB.
5. **Real-time Alert**: A WebSocket event is emitted to notify the connected frontend clients of the new ticket.

## Storage and Internal Model
- **MongoDB**: Used for its flexible document schema. 
- **Topology Representation**: The grid is represented as a Graph. Poles are Nodes, and wire connections are Edges. We use an **Adjacency List** in memory for fast O(V+E) traversals during fault localization.

## Localization Algorithm & Missing Topology (The 60% Problem)
- **Algorithm**: When a fault is reported, we traverse the adjacency list outward from the reporting node to find the boundary between energized and de-energized poles.
- **Handling Missing Topology**: Since 60% of transformers have no recorded pole ordering, we dynamically infer missing connections using the **Haversine formula** (spatial proximity) and a **Minimum Spanning Tree (MST)** algorithm. This reconstructs the most probable physical wire connections before localization begins.

## API Surface
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/telemetry` | `POST` | Ingests telemetry data and triggers localization. |
| `/tickets` | `GET` | Retrieves all active and resolved fault tickets. |
| `/tickets/:id/resolve`| `POST`| Marks a ticket as resolved (validates state first). |
| `/graph` | `GET` | Returns the current topology graph (nodes and edges). |

## UI Reasoning
The operator dashboard is designed for high-stress environments.
- **Immediate Focus**: Active tickets and a map view are front and center.
- **Omissions**: Raw telemetry logs are hidden to avoid cognitive overload. We expect operators might initially distrust the inferred topology, so tickets clearly state if they are based on inferred connections.

## AI Feature
- The AI feature assists in reverse-geocoding and prioritizing tickets based on historical patterns. If unavailable, the system gracefully degrades to basic lat/lng reporting without blocking the pipeline.
