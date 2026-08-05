# Decisions Log

This is a reverse-chronological log of the major architectural and design decisions made during the development of the Propel AI Smart Grid System.

---

## [2026-08-05] Frontend Map Visualization states
**Decision:** Display Dead Sensors as Orange rather than Red on the SVG Map.
**Alternative:** Leave Dead Sensors Red since they are de-energized.
**Reasoning:** Operator trust is paramount. If a dead sensor looks identical to a span fault visually, but generates no ticket, the operator will assume the ticketing engine is broken. Visually distinguishing "Noise" (Orange) from a verified "Fault" (Red) builds system trust.

## [2026-08-05] Inferring Missing Topology via Haversine MST
**Decision:** Use the Haversine distance formula combined with a Minimum Spanning Tree (MST) to infer the missing 60% of the network connections.
**Alternative:** Assume linear connections by `seq` ID, or ask the user to manually input connections.
**Reasoning:** Electrical wires are physical assets that cost money. Utilities inherently route them over the shortest possible distance. By calculating geographical distances between all orphaned poles belonging to a transformer and generating an MST, we statistically approximate the actual wiring layout with high accuracy, requiring zero manual operator input.
**Fragility/Future Work:** Wires follow roads, not straight lines through buildings. With two more weeks, I would integrate the OSRM (Open Source Routing Machine) API to snap coordinates to the street grid before running the MST algorithm.

## [2026-08-05] Handling Noise & Dead Sensors
**Decision:** If a pole reports `energized: false` but its downstream children are still reporting `energized: true`, ignore the event and do not generate a ticket.
**Alternative:** Generate a low-priority "Maintenance" ticket.
**Reasoning:** The assignment brief strictly warns against alert fatigue ("A system that fires on dead modems gets ignored"). Therefore, single-node physical impossibilities are aggressively classified as noise. 

## [2026-08-05] Sequence Based Deduplication
**Decision:** Track the latest `seq` number in-memory per pole and drop incoming payloads where `payload.seq <= known.seq`.
**Alternative:** Rely on `timestamp` (ts) for chronologically sorting messages.
**Reasoning:** IoT Edge devices suffer heavily from clock drift and NTP synchronization failures. Relying on an integer sequence guarantees order even if the internal clock of a device resets to UNIX Epoch 1970.

## [2026-08-05] Database Choice
**Decision:** MongoDB for Storage, Node.js Memory for Graph Traversal.
**Alternative:** Neo4j (Graph DB) or PostgreSQL (Relational).
**Reasoning:** While Neo4j is perfect for graph traversal, it adds significant operational complexity for a simple radial distribution network. By storing flat data in MongoDB and building an Adjacency List in memory during Node.js boot, we achieve O(1) in-memory traversal speed with the ease of deployment of a document store.
