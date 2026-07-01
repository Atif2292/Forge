# FORGE — AI Fitness Platform

A demo fitness platform: log your stats, get an AI-generated training plan, compare gym memberships.

**Stack:** React + TypeScript (Vite) frontend, Node.js + TypeScript (Express) backend, SQLite storage, [OpenRouter](https://openrouter.ai) for free LLM inference. Runs on [Bun](https://bun.sh).

## Setup

```bash
bun install

# Add a free OpenRouter API key (no credit card required) to enable real AI plan generation:
# 1. Sign up at https://openrouter.ai/keys
# 2. Copy apps/api/.env.example -> apps/api/.env if you haven't already, and paste the key into OPENROUTER_API_KEY
# Without a key, the app still works using a built-in rule-based plan generator as a fallback.

bun run dev:api    # starts API on http://localhost:4000
bun run dev:web    # starts frontend on http://localhost:5173 (in a second terminal)
```

Visit http://localhost:5173, sign up, log your stats, and generate a plan.

## Project structure

- `apps/web` — React + TypeScript frontend (Vite)
- `apps/api` — Express + TypeScript backend, SQLite database, OpenRouter integration
# Forge
