import Link from "next/link";
import { Header } from "@/components/Header";

const FEATURES = [
  {
    icon: "◆",
    title: "Agent trace viewer",
    body: "See the full swarm as a tree — every agent, LLM call, and tool hop.",
  },
  {
    icon: "⚙",
    title: "Tool-call timeline",
    body: "A waterfall of latency, tokens, and cost for each step of the run.",
  },
  {
    icon: "⏮",
    title: "Replay mode",
    body: "Scrub a playhead through the run and watch decisions unfold live.",
  },
  {
    icon: "≠",
    title: "Prompt diffing",
    body: "Red/green diff any two prompt versions to see what actually changed.",
  },
  {
    icon: "✓",
    title: "Eval scores",
    body: "LLM-as-judge grades every run for correctness and quality.",
  },
  {
    icon: "⦿",
    title: "Failure clustering",
    body: "Group failures — timeouts, bad tool args, hallucinations — into buckets.",
  },
];

const STATS = [
  { label: "agents traced", value: "3" },
  { label: "tool calls / run", value: "12+" },
  { label: "replay latency", value: "0ms" },
  { label: "silent failures", value: "0" },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header active="home" />

      {/* hero */}
      <section className="relative flex flex-col items-center overflow-hidden px-6 pt-24 pb-16 text-center">
        <div aria-hidden className="tz-grid absolute inset-0 opacity-40" />
        <div aria-hidden className="tz-glow absolute inset-0" />

        <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-ok/30 bg-ok/10 px-4 py-1 font-mono text-[11px] uppercase tracking-widest text-ok">
            <span className="tz-live-dot h-1.5 w-1.5 rounded-full bg-ok" />
            observability + replay for multi-agent systems
          </span>

          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-zinc-50 sm:text-6xl">
            The flight recorder &amp;<br />
            <span className="text-ok">time machine</span> for AI agent swarms
          </h1>

          <p className="max-w-xl text-lg leading-8 text-zinc-400">
            Multi-agent systems fail silently. telemetryZero traces every tool
            call, replays any run, diffs the prompt, and lets you fix a failing
            agent and watch it recover — live.
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/explorer?run=live"
              className="group flex h-12 items-center justify-center gap-2 rounded-lg bg-ok px-6 font-medium text-[#03130d] transition-transform hover:scale-[1.02]"
            >
              <span className="tz-live-dot h-2 w-2 rounded-full bg-[#03130d]" />
              Run a live agent
            </Link>
            <Link
              href="/explorer"
              className="flex h-12 items-center justify-center rounded-lg border border-line bg-panel px-6 font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-panel-2"
            >
              Load a demo trace →
            </Link>
          </div>

          <p className="font-mono text-xs text-zinc-600">
            powered by Tavily web search · OpenAI · Vercel AI SDK
          </p>
        </div>

        {/* stat strip */}
        <div className="relative z-10 mt-16 grid w-full max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-panel px-4 py-5">
              <div className="font-mono text-2xl font-semibold text-zinc-100">
                {s.value}
              </div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* features */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-line bg-panel p-5 transition-colors hover:border-zinc-700 hover:bg-panel-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-canvas font-mono text-lg text-ok">
                {f.icon}
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-100">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-zinc-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-auto border-t border-line px-6 py-6 text-center font-mono text-xs text-zinc-600">
        telemetryZero · built at Hack Your Way Into the Hacker House ·{" "}
        <a
          href="https://github.com/panforrest/telemetryZero"
          className="text-zinc-500 hover:text-zinc-300"
        >
          github.com/panforrest/telemetryZero
        </a>
      </footer>
    </div>
  );
}
