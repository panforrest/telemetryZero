"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Span, SpanKind, Trace } from "@/lib/types";
import { fmtMs, fmtTokens, fmtUsd, relativeTime } from "@/lib/format";

const KIND_COLOR: Record<SpanKind, string> = {
  agent: "#10b981",
  llm: "#818cf8",
  tool: "#f59e0b",
  eval: "#38bdf8",
};

const KIND_GLYPH: Record<SpanKind, string> = {
  agent: "◆",
  llm: "✦",
  tool: "⚙",
  eval: "✓",
};

function barColor(span: Span): string {
  if (span.status === "error") return "#ef4444";
  return KIND_COLOR[span.kind];
}

function StatusPill({ status }: { status: Span["status"] }) {
  const map = {
    ok: { c: "#10b981", label: "ok" },
    error: { c: "#ef4444", label: "error" },
    running: { c: "#38bdf8", label: "running" },
  } as const;
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
      style={{ color: s.c, backgroundColor: `${s.c}1a` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.c }} />
      {s.label}
    </span>
  );
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-line px-3 py-2">
      <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
        {children}
      </span>
    </div>
  );
}

const DEFAULT_TASK =
  "Find the 3 most-funded AI-agent observability startups in 2026 and summarize how each differentiates.";

export function ExplorerClient({ traces: initialTraces }: { traces: Trace[] }) {
  const [traces, setTraces] = useState<Trace[]>(initialTraces);
  const [selectedTraceId, setSelectedTraceId] = useState(initialTraces[0]?.id);
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null);
  const [task, setTask] = useState(DEFAULT_TASK);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trace = useMemo(
    () => traces.find((t) => t.id === selectedTraceId) ?? traces[0],
    [traces, selectedTraceId],
  );
  const selectedSpan = useMemo(
    () => trace.spans.find((s) => s.id === selectedSpanId) ?? null,
    [trace, selectedSpanId],
  );

  function selectTrace(id: string) {
    setSelectedTraceId(id);
    setSelectedSpanId(null);
  }

  async function runLive() {
    if (!task.trim() || running) return;
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Run failed");
      setTraces((prev) => [data.trace as Trace, ...prev]);
      setSelectedTraceId(data.trace.id);
      setSelectedSpanId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Run failed");
    } finally {
      setRunning(false);
    }
  }

  const topLevel = trace.spans.filter((s) => s.parentId === null);

  return (
    <div className="flex h-screen min-h-full flex-col">
      {/* header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-canvas/80 px-5 backdrop-blur">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="tz-live-dot h-2.5 w-2.5 rounded-full bg-ok" />
          <span className="font-mono text-sm font-semibold tracking-tight text-zinc-100">
            telemetry<span className="text-ok">Zero</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 font-mono text-xs">
          <Link href="/" className="rounded-md px-3 py-1.5 text-zinc-500 hover:text-zinc-200">
            overview
          </Link>
          <span className="rounded-md bg-panel-2 px-3 py-1.5 text-zinc-100">
            trace explorer
          </span>
        </nav>
      </header>

      {/* toolbar */}
      <div className="flex flex-col border-b border-line bg-panel">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="font-mono text-xs text-zinc-500">run</span>
            <span className="truncate font-mono text-sm text-zinc-200">
              {trace.title}
            </span>
            <StatusPill status={trace.status} />
          </div>

          <div className="flex max-w-xl flex-1 items-center gap-2">
            <input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runLive()}
              disabled={running}
              placeholder="Give the agent swarm a task…"
              className="h-8 w-full rounded-md border border-line bg-canvas px-3 font-mono text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-ok/50 disabled:opacity-60"
            />
            <button
              onClick={runLive}
              disabled={running}
              className="flex h-8 shrink-0 items-center gap-2 rounded-md bg-ok px-3 font-mono text-xs font-medium text-[#03130d] transition-transform hover:scale-[1.03] disabled:opacity-60 disabled:hover:scale-100"
            >
              {running ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#03130d] border-t-transparent" />
                  running
                </>
              ) : (
                <>
                  <span className="tz-live-dot h-1.5 w-1.5 rounded-full bg-[#03130d]" />
                  run agent
                </>
              )}
            </button>
          </div>

          <div className="hidden items-center gap-4 font-mono text-xs text-zinc-500 lg:flex">
            <span>⏱ {fmtMs(trace.totalMs)}</span>
            <span>◇ {fmtTokens(trace.totalTokens)} tok</span>
            <span>$ {fmtUsd(trace.totalCostUsd)}</span>
          </div>
        </div>

        {error && (
          <div className="border-t border-err/30 bg-err/10 px-4 py-1.5 font-mono text-[11px] text-red-300">
            ⚠ {error}
          </div>
        )}
        {running && (
          <div className="border-t border-ok/20 bg-ok/5 px-4 py-1.5 font-mono text-[11px] text-ok">
            <span className="tz-live-dot mr-2 inline-block h-1.5 w-1.5 rounded-full bg-ok" />
            swarm running · Researcher → Analyst → Writer → Judge · hitting Tavily + OpenAI…
          </div>
        )}
      </div>

      {/* body */}
      <div className="grid flex-1 grid-cols-[260px_1fr_360px] overflow-hidden">
        {/* LEFT */}
        <aside className="tz-scroll flex flex-col overflow-y-auto border-r border-line bg-panel">
          <PanelLabel>runs</PanelLabel>
          <div className="flex flex-col gap-1.5 p-2">
            {traces.map((t) => {
              const active = t.id === trace.id;
              const dot =
                t.status === "error" ? "#ef4444" : t.status === "running" ? "#38bdf8" : "#10b981";
              return (
                <button
                  key={t.id}
                  onClick={() => selectTrace(t.id)}
                  className={`flex flex-col gap-1.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    active
                      ? "border-ok/40 bg-ok/5"
                      : "border-line bg-canvas hover:border-zinc-700 hover:bg-panel-2"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: dot }} />
                    <span className="truncate text-xs font-medium text-zinc-200">{t.title}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500">
                    <span>{relativeTime(t.createdAt)}</span>
                    <span>
                      {fmtMs(t.totalMs)} ·{" "}
                      <span style={{ color: t.eval ? (t.eval.overall >= 70 ? "#10b981" : t.eval.overall >= 40 ? "#f59e0b" : "#ef4444") : "#71717a" }}>
                        {t.eval ? `${t.eval.overall}` : "—"}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <PanelLabel>span tree</PanelLabel>
          <div className="flex flex-col p-1.5">
            {topLevel.map((parent) => {
              const children = trace.spans.filter((s) => s.parentId === parent.id);
              return (
                <div key={parent.id} className="flex flex-col">
                  <SpanTreeRow
                    span={parent}
                    depth={0}
                    selected={selectedSpanId === parent.id}
                    onSelect={setSelectedSpanId}
                  />
                  {children.map((c) => (
                    <SpanTreeRow
                      key={c.id}
                      span={c}
                      depth={1}
                      selected={selectedSpanId === c.id}
                      onSelect={setSelectedSpanId}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </aside>

        {/* CENTER: timeline */}
        <main className="tz-grid flex flex-col overflow-hidden bg-canvas">
          <PanelLabel>tool-call timeline · waterfall</PanelLabel>
          <div className="tz-scroll flex-1 overflow-y-auto p-3">
            {/* time axis */}
            <div className="mb-2 flex pl-[184px]">
              <div className="relative h-4 flex-1 border-l border-line-soft">
                {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                  <span
                    key={f}
                    className="absolute -translate-x-1/2 font-mono text-[9px] text-zinc-600"
                    style={{ left: `${f * 100}%` }}
                  >
                    {fmtMs(trace.totalMs * f)}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {trace.spans.map((span) => {
                const leftPct = (span.startMs / trace.totalMs) * 100;
                const widthPct = Math.max((span.durationMs / trace.totalMs) * 100, 1.5);
                const isAgent = span.kind === "agent";
                const selected = selectedSpanId === span.id;
                return (
                  <button
                    key={span.id}
                    onClick={() => setSelectedSpanId(span.id)}
                    className={`group flex items-center rounded-md px-1 py-1 text-left transition-colors ${
                      selected ? "bg-panel-2 ring-1 ring-ok/40" : "hover:bg-panel/60"
                    }`}
                  >
                    <div
                      className="flex w-[176px] shrink-0 items-center gap-1.5 pr-2"
                      style={{ paddingLeft: isAgent ? 0 : 14 }}
                    >
                      <span
                        className="font-mono text-[11px]"
                        style={{ color: barColor(span) }}
                      >
                        {KIND_GLYPH[span.kind]}
                      </span>
                      <span
                        className={`truncate font-mono text-[11px] ${
                          isAgent ? "font-semibold text-zinc-200" : "text-zinc-400"
                        }`}
                      >
                        {span.name}
                      </span>
                    </div>
                    <div className="relative h-5 flex-1">
                      <div
                        className="absolute top-1/2 h-3 -translate-y-1/2 rounded-sm transition-all group-hover:brightness-125"
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          backgroundColor: barColor(span),
                          opacity: isAgent ? 0.35 : 0.95,
                          border: span.status === "error" ? "1px solid #fca5a5" : "none",
                        }}
                      />
                      <span
                        className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap pl-1 font-mono text-[9px] text-zinc-500"
                        style={{ left: `calc(${leftPct}% + ${widthPct}%)` }}
                      >
                        {fmtMs(span.durationMs)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </main>

        {/* RIGHT: inspector */}
        <aside className="tz-scroll flex flex-col overflow-y-auto border-l border-line bg-panel">
          <PanelLabel>{selectedSpan ? "span inspector" : "run overview"}</PanelLabel>
          {selectedSpan ? (
            <SpanInspector span={selectedSpan} />
          ) : (
            <RunOverview trace={trace} />
          )}
        </aside>
      </div>
    </div>
  );
}

function SpanTreeRow({
  span,
  depth,
  selected,
  onSelect,
}: {
  span: Span;
  depth: number;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const color = barColor(span);
  return (
    <button
      onClick={() => onSelect(span.id)}
      className={`flex items-center gap-2 rounded-md py-1.5 pr-2 text-left transition-colors ${
        selected ? "bg-panel-2 ring-1 ring-ok/40" : "hover:bg-canvas"
      }`}
      style={{ paddingLeft: 8 + depth * 16 }}
    >
      <span className="font-mono text-[11px]" style={{ color }}>
        {KIND_GLYPH[span.kind]}
      </span>
      <span
        className={`flex-1 truncate font-mono text-[11px] ${
          depth === 0 ? "font-semibold text-zinc-200" : "text-zinc-400"
        }`}
      >
        {span.name}
      </span>
      {span.status === "error" && (
        <span className="h-1.5 w-1.5 rounded-full bg-err" />
      )}
    </button>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg border border-line bg-canvas p-2.5 text-center">
      <div className="font-mono text-sm" style={{ color: color ?? "#e5e7eb" }}>
        {value}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </div>
    </div>
  );
}

function SpanInspector({ span }: { span: Span }) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span
            className="rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
            style={{ color: KIND_COLOR[span.kind], backgroundColor: `${KIND_COLOR[span.kind]}1a` }}
          >
            {span.kind}
          </span>
          <StatusPill status={span.status} />
        </div>
        <div className="font-mono text-sm text-zinc-100">{span.name}</div>
        <div className="font-mono text-[11px] text-zinc-500">agent · {span.agent}</div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Metric label="latency" value={fmtMs(span.durationMs)} />
        <Metric
          label="tokens"
          value={
            span.tokensIn != null
              ? fmtTokens((span.tokensIn ?? 0) + (span.tokensOut ?? 0))
              : "—"
          }
        />
        <Metric label="cost" value={span.costUsd != null ? fmtUsd(span.costUsd) : "—"} />
      </div>

      {span.failureType && (
        <div className="rounded-lg border border-err/40 bg-err/10 px-3 py-2 font-mono text-[11px] text-red-300">
          failure cluster · {span.failureType}
        </div>
      )}

      {span.input && (
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
            input
          </span>
          <pre className="tz-scroll max-h-52 overflow-auto whitespace-pre-wrap rounded-lg border border-line bg-canvas p-3 font-mono text-[11px] leading-5 text-zinc-300">
            {span.input}
          </pre>
        </div>
      )}

      {span.output && (
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
            output
          </span>
          <pre className="tz-scroll max-h-52 overflow-auto whitespace-pre-wrap rounded-lg border border-line bg-canvas p-3 font-mono text-[11px] leading-5 text-zinc-300">
            {span.output}
          </pre>
        </div>
      )}

      {span.error && (
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-red-400">
            error
          </span>
          <pre className="whitespace-pre-wrap rounded-lg border border-err/40 bg-err/10 p-3 font-mono text-[11px] leading-5 text-red-300">
            {span.error}
          </pre>
        </div>
      )}
    </div>
  );
}

function RunOverview({ trace }: { trace: Trace }) {
  const evalColor = trace.eval
    ? trace.eval.overall >= 70
      ? "#10b981"
      : trace.eval.overall >= 40
        ? "#f59e0b"
        : "#ef4444"
    : "#71717a";
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          task
        </span>
        <p className="rounded-lg border border-line bg-canvas p-3 text-[13px] leading-6 text-zinc-300">
          {trace.task}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {trace.agents.map((a) => (
          <span
            key={a}
            className="rounded border border-line bg-canvas px-2 py-1 font-mono text-[10px] text-zinc-400"
          >
            ◆ {a}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Metric label="duration" value={fmtMs(trace.totalMs)} />
        <Metric label="tokens" value={fmtTokens(trace.totalTokens)} />
        <Metric label="cost" value={fmtUsd(trace.totalCostUsd)} />
      </div>

      {trace.eval && (
        <div className="flex flex-col gap-2 rounded-xl border border-line bg-canvas p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              eval · llm-as-judge
            </span>
            <span className="font-mono text-2xl font-semibold" style={{ color: evalColor }}>
              {trace.eval.overall}
              <span className="text-xs text-zinc-600">/100</span>
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <ScoreBar label="correctness" value={trace.eval.correctness} />
            <ScoreBar label="relevance" value={trace.eval.relevance} />
          </div>
          <p className="mt-1 text-[11px] leading-5 text-zinc-500">{trace.eval.reasoning}</p>
        </div>
      )}

      <p className="text-center font-mono text-[10px] text-zinc-600">
        select a span in the timeline to inspect it
      </p>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "#10b981" : value >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 font-mono text-[10px] text-zinc-500">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="w-6 text-right font-mono text-[10px] text-zinc-400">{value}</span>
    </div>
  );
}
