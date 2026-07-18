# telemetryZero

### The flight recorder & time machine for AI agent swarms

An **observability + replay layer for multi-agent systems**. telemetryZero traces every agent, LLM call, and tool call onto a single timeline — then lets you **replay** any run, inspect where it failed, and see the eval score behind every result.

**Live:** https://telemetryzero.vercel.app · **Repo:** https://github.com/panforrest/telemetryZero

Built in one day at **Hack Your Way Into the Hacker House** (powered by OnlyExit), July 18, 2026.

---

## Why it exists

Multi-agent systems fail **silently**. When a swarm of agents breaks, teams can't tell *which agent*, *which tool call*, or *which prompt* caused it — and some runs *look* successful while quietly hallucinating. telemetryZero turns that black box into a glass box.

## Features

- **Agent trace viewer** — the full swarm as a tree: every agent, LLM call, and tool hop
- **Tool-call timeline** — a waterfall of latency, tokens, and cost per step
- **Failure clustering** — auto-buckets failures (`bad_tool_arg`, `hallucination`, `timeout`)
- **Eval scores** — an LLM-as-judge grades every run 0–100 for correctness and relevance
- **Replay mode** — scrub a playhead through any run and watch the decision path unfold live
- **Live agent runs** — a real **Researcher → Analyst → Writer → Judge** swarm, traced in real time

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — custom dark "mission-control" design system
- **OpenAI** — agent reasoning + LLM-as-judge evals
- **Tavily** — live web search tool for the agent swarm *(sponsor)*
- **Vercel** — deployment

## Getting started

```bash
# 1. install
npm install

# 2. add your keys (copy the template)
cp .env.example .env.local
# then fill in OPENAI_API_KEY and TAVILY_API_KEY

# 3. run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app works fully on 3 built-in demo traces even without API keys; add keys to enable live agent runs.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Agent reasoning + eval scoring |
| `TAVILY_API_KEY` | Live web search tool ([get one free](https://app.tavily.com)) |
| `OPENAI_MODEL` | Optional model override (default `gpt-4o-mini`) |

## What's next

Prompt-diff + fix-and-rerun · rollback snapshots · aggregated agent DAG view · OpenTelemetry ingest so any framework can pipe traces in.

---

# Pitch Deck

## Page 1 — The Problem & The Fix

### telemetryZero — the flight recorder & time machine for AI agent swarms

**The problem**

Multi-agent systems fail **silently**. When a swarm of agents breaks, teams can't tell *which agent*, *which tool call*, or *which prompt* caused it. Worse — some runs *look* successful but quietly hallucinate.

**The fix**

telemetryZero traces every agent, LLM call, and tool call onto one timeline — then lets you **replay** any run and see exactly where it went wrong.

> One line: **Datadog + a time machine, built for AI agents.**

---

## Page 2 — The Product (Demo)

**What it does**

- **Trace viewer** — the full swarm as a tree: every agent, LLM call, tool hop
- **Tool-call timeline** — latency, tokens, and cost per step
- **Failure clustering** — auto-buckets `bad_tool_arg`, `hallucination`, `timeout`
- **Eval scores** — an LLM-as-judge grades every run 0–100
- **⭐ Replay mode** — scrub a playhead through any run and watch the decision path unfold live

**Under the hood**

Live **Researcher → Analyst → Writer → Judge** swarm, running in real time on **Tavily** (web search) + OpenAI, fully instrumented. Next.js + Vercel. **Shipped & live in one day.**

> Unlike a chatbot that just gives you an answer, telemetryZero shows you the entire reasoning path that produced it — every source, every step — so you can trust it or debug it.

---

## Page 3 — Why It Wins

**Why now**

Agents went from demos to production in 2026. Every serious team now runs multi-agent systems — and every one of them needs observability + evals. LangSmith, Langfuse, and Arize prove the category is real and **venture-scale**.

**Our wedge**

Faster, more visual, and **replay-first**. We don't just log — we let you *re-live* and debug a run. Framework-agnostic, zero-config to start.

**Market**

Rides the AI-agent infra wave — the observability layer every agent team eventually buys.

**What's next**

Prompt-diff + fix-and-rerun · rollback snapshots · aggregated agent DAG view · OpenTelemetry ingest for any framework.

**The team**

**Forrest Pan** — full-stack builder (Node/React/TS/Python). Shipped & deployed this end-to-end in a single hackathon day.

- GitHub: https://github.com/panforrest
- LinkedIn: https://www.linkedin.com/in/forrest-pan-153733232/
- YouTube: https://www.youtube.com/@forrestpan1761

**Live:** https://telemetryzero.vercel.app · **Code:** https://github.com/panforrest/telemetryZero
