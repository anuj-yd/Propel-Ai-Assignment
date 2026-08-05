# Architecture

## 1. System Diagram

```mermaid
graph TD
    A[IoT Pole Sensors] -->|REST/Telemetry| B(Telemetry Ingestion Controller)
    B --> C{Validation & Sequence Check}
    C -- Stale/Duplicate --> D[Drop]
    C -- Valid --> E[Telemetry Service]
    
    E --> F[Network Graph Builder]
    F -->|Infers missing wires via MST| G[SpanDetector / FeederDetector]
    
    G -- Noise/Scheduled --> H[Ignore]
    G -- Fault Detected --> I[Ticket Service]
    
    I --> J[Offline Geocoder (OSM)]
    I --> K[OpenAI AI Service]
    
    J --> L[(MongoDB)]
    K --> L
    I --> L
    
    L -->|Websocket Emit| M[React Operator Dashboard]
```

## 2. Data Sourcing and Ingestion

* **Out-of-Order & Duplicate Handling:** We strictly enforce sequence numbers (`seq`). The `TelemetryService` caches the latest `seq` for every pole in memory. If a payload arrives with a `seq` lower than or equal to the known latest, it is aggressively dropped as a stale or duplicate message. 
* **Clock Skew:** By relying on `seq` rather than the payload `ts` (timestamp), we eliminate clock drift issues across disparate edge IoT devices.
* **Burst Handling:** The controller immediately acknowledges receipt (202 Accepted) before heavy graph computation begins, preventing connection timeouts during storm bursts.

## 3. Storage and Internal Model

We use **MongoDB** to store `Poles`, `Connections`, `Telemetry`, and `Tickets`. 

* **Why MongoDB?** The network graph is technically relational, but querying sub-trees recursively in PostgreSQL (using CTEs) can become a bottleneck at high scale. By storing an Adjacency List in Node.js memory built from MongoDB flat collections, we get O(1) read speeds for graph traversal.
* **Network Representation:** The network is represented internally as an Adjacency List (`Map<PoleId, Set<Children>>`). 

## 4. The Localization Algorithm & Topology Inference

### Solving the 60% Missing Topology Problem
Since 60% of transformers have no recorded pole ordering, we cannot traverse the tree reliably. To solve this, our `TopologyService` implements the **Minimum Spanning Tree (MST)** algorithm combined with the **Haversine Formula**:
1. When the network is loaded, we group poles by their `transformerId`.
2. We calculate the geographical distance (Haversine) between every pole in the group.
3. We apply Prim's/Kruskal's MST algorithm to infer the most likely radial wiring structure (since power lines inherently follow the shortest physical path to save copper).
4. This inferred MST is seamlessly merged with the known database connections.

### Finding the Boundary
When a fault occurs:
1. We walk the Adjacency List to find the target pole's neighbors.
2. We identify the `darkNodes` and `liveNeighbours`.
3. The boundary is defined as `[last_live_pole, first_dark_pole]`. 

### Simultaneous Faults & Grouping
The algorithm processes incidents concurrently but groups them geographically. If multiple poles in the same branch go dark, the algorithm traces up the tree to find the highest common dark ancestor, preventing 30 tickets from being generated for a single snapped wire.

## 5. Noise Handling

* **Dead Sensors:** If a pole reports `energized: false`, but the algorithm sees that its downstream children are `energized: true`, this is physically impossible for a wire break. The `SpanDetector` classifies this as **Noise** and halts ticket generation.
* **Scheduled Outages:** If the `event` type is `scheduled_outage` or `maintenance`, the pipeline drops the event entirely.

## 6. API Surface

| Method | Endpoint | Purpose | Shape (Request) |
|--------|----------|---------|-----------------|
| POST | `/telemetry` | Ingest IoT data | `{ device_id, pole_id, event, energized, seq }` |
| GET | `/tickets` | Fetch active faults | `void` |
| POST | `/tickets/:id/resolve` | Manual resolution | `void` |
| GET | `/network` | Fetch graph data | `void` |

## 7. UI Reasoning

The Operator Dashboard is split into two clear areas:
1. **The Visual Graph (Right/Top):** An SVG-based topology map. Live nodes are green, Faults are red, and Dead Sensors are orange. This gives the operator instant situational awareness.
2. **The Active Ticket Feed (Left):** Actionable items only. We deliberately **excluded** dead sensors and scheduled outages from the ticket feed so operators do not succumb to alert fatigue. 
3. **What I expect to be wrong:** The Haversine MST inference assumes wires run straight. In reality, wires follow roads. A future iteration should snap coordinates to road networks before running MST.

## 8. The AI Feature

* **What it is:** The AI (`OpenAI GPT-3.5`) acts as a Dispatch Assistant. It reads the fault boundary and pincode, and generates a short briefing for the field crew (suggesting ladders, voltage gear, etc.).
* **Why here?** It bridges the gap between raw data ("Span Fault P1-P2") and human action ("Take a 40ft ladder to Sector 12").
* **Cost / Failure Mode:** It costs fractions of a cent per call. If the LLM times out or is unavailable, the `AiService` gracefully degrades to a static string, ensuring the ticket is still created without delay.
