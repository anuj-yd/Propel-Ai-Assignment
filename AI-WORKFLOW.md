# AI Workflow

## AI Tools Used
- **Antigravity (Gemini)**: Used as an agentic coding assistant to scaffold the backend, generate the Docker setup, and draft documentation.

## What was Delegated vs. Written Manually
- **Delegated**: Docker orchestration (`Dockerfile`, `docker-compose.yml`), boilerplate Express setup, and initial Markdown drafting. This is standard infrastructure where AI excels and saves time.
- **Written Manually / Heavily Guided**: The core localization algorithm and the Haversine/MST logic for the "60% problem". The business logic requirements were too specific (Graph theory + spatial constraints) to rely entirely on zero-shot AI generation.

## AI Hallucinations / Mistakes
1. **Docker Frontend Porting**: The AI initially suggested running `npm run dev` for the frontend inside Docker. I recognized this is bad practice for a "production-like" setup and guided it to use a multi-stage Nginx build instead.
2. **Missing Volume Persistence**: Early iterations of the Docker setup forgot to include a persistent volume for MongoDB, meaning data would wipe on restart. This was caught and fixed.

## Code Generation Estimate
- Roughly **40-50%** of the raw lines of code (mostly boilerplate, config, and documentation) were AI-generated or heavily AI-assisted. 
- The core logical algorithms (Graph traversal, MST) were primarily hand-designed.
