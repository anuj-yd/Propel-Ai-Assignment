# AI Workflow & Collaboration

This document outlines how I used AI (Gemini) to build this project, where it saved me hours of work, and where I had to step in because the AI completely missed the physical realities of the problem.

## 1. Tools Used
- **Agentic IDE Assistant:** Used as my primary pair programmer to generate React boilerplate, configure Tailwind CSS, and write the heavy graph-traversal logic in Node.js.
- **Gemini 1.5 Flash (Runtime API):** Integrated into the backend (`AiService.js`) to generate natural language briefings for the repair crews.

## 2. Delegation vs. Manual Control

**What I delegated wholesale:**
- **UI & Styling:** I asked the AI to build the React component structure and apply Tailwind CSS. I didn't want to spend time centering divs when the core problem was algorithmic.
- **Boilerplate & Config:** Docker Compose files, Express routing, and MongoDB schema setups.
- **Math:** The actual implementation of the Haversine formula and SVG coordinate mapping (though I had to fix the logic, the AI wrote the raw math).

**What I tightly controlled manually:**
- **The Domain Logic:** The AI initially wanted to create a fault ticket *every* time a pole reported `energized: false`. I had to manually stop it, point it to `01-problem-context.md`, and force it to write a specific `SpanDetector` to filter out "Dead Sensors" (when a pole is dark but its children are live). The AI doesn't understand physics; I had to enforce that rule.
- **State Pushback:** The AI built a simple "resolve ticket" button. I had to manually intervene and write the logic that blocks resolution if the physical telemetry still shows the poles as dark.

## 3. Where the AI Failed (Concrete Cases)

1. **The SVG Coordinate Disaster:**
   I asked the AI to render a network map based on the pole's latitude and longitude. It wrote the SVG correctly, but because the synthetic poles are only 0.0001 degrees apart in real life, the AI drew every single pole overlapping each other in the bottom left corner. *How I caught & fixed it:* I saw a messy blob on my screen. I had to manually re-seed the MongoDB coordinates to an evenly spaced grid and instruct the AI to scale the SVG viewBox properly.

2. **The Infinite Graph Loop:**
   While building the fault localization algorithm, the AI wrote a recursive function to walk the tree. However, it forgot that an Adjacency List is bi-directional. It just kept bouncing between `P1 -> P2 -> P1 -> P2` until the Node.js server crashed with a Stack Overflow. *How I caught & fixed it:* The terminal crashed instantly on my first test. I stepped in and told the AI it needed to use a `Set` to track `visited` nodes during traversal.

3. **The Unhandled React Crash:**
   The AI converted a dynamic `import()` to a top-level import in `NetworkMap.jsx` but messed up the fallback array state. The entire React app crashed to a blank White Screen of Death. *How I caught it:* I wrapped `App.jsx` in a custom `<ErrorBoundary>` so I could see the exact stack trace, found the `.filter()` error on an undefined variable, and guided the AI to add a safe fallback.

## 4. Percentage AI-Generated
I estimate **80-85%** of the raw syntax in this repository was typed by the AI. However, **100% of the architectural decisions**, problem-solving strategies, and debugging directions came from me. The AI was an incredibly fast typist, but a terrible architect.

## 5. Favorite Prompt / Excerpt
The most satisfying moment was solving the missing topology problem (the 60% of transformers with no recorded pole ordering). The AI initially suggested we just connect poles by their ID sequence. I rejected that and wrote this prompt:

> *"That's not how power lines work in the real world. We know where the poles are geographically. Wires cost money, so they take the shortest path. I want you to write a service that takes all orphaned poles under a transformer, calculates the distance between them using the Haversine formula, and then runs a Minimum Spanning Tree (MST) algorithm to infer the physical wire connections before the server boots."*
