// telemetryZero core trace model — shared across the app.

export type SpanKind = "agent" | "llm" | "tool" | "eval";
export type SpanStatus = "ok" | "error" | "running";

export interface Span {
  id: string;
  parentId: string | null;
  /** which agent produced this span, e.g. "Researcher" */
  agent: string;
  kind: SpanKind;
  /** short human label, e.g. "tavily.search" or "gpt-4o-mini" */
  name: string;
  status: SpanStatus;
  /** ms offset from trace start */
  startMs: number;
  /** duration in ms */
  durationMs: number;
  /** token + cost accounting (LLM spans) */
  tokensIn?: number;
  tokensOut?: number;
  costUsd?: number;
  /** the model/tool input (prompt, tool args) */
  input?: string;
  /** the produced output */
  output?: string;
  /** populated when status === "error" */
  error?: string;
  /** failure bucket for clustering, e.g. "bad_tool_arg" | "timeout" | "hallucination" */
  failureType?: string;
}

export interface EvalScore {
  /** 0-100 overall quality */
  overall: number;
  correctness: number;
  relevance: number;
  reasoning: string;
}

export interface Trace {
  id: string;
  title: string;
  createdAt: string;
  /** the user task the agent swarm was given */
  task: string;
  status: SpanStatus;
  totalMs: number;
  totalCostUsd: number;
  totalTokens: number;
  spans: Span[];
  eval?: EvalScore;
  /** which agents participated, in order */
  agents: string[];
}

export const STATUS_COLOR: Record<SpanStatus, string> = {
  ok: "var(--ok)",
  error: "var(--err)",
  running: "var(--info)",
};

export const KIND_ICON: Record<SpanKind, string> = {
  agent: "◆",
  llm: "✦",
  tool: "⚙",
  eval: "✓",
};
