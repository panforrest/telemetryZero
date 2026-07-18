import type { EvalScore, Span, Trace } from "./types";

// Per-1K-token pricing (USD). Extend as needed.
const PRICING: Record<string, { in: number; out: number }> = {
  "gpt-4o-mini": { in: 0.15 / 1000, out: 0.6 / 1000 },
  "gpt-4o": { in: 2.5 / 1000, out: 10 / 1000 },
};

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

function priceFor(model: string) {
  return PRICING[model] ?? PRICING["gpt-4o-mini"];
}

interface LLMResult {
  content: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
}

async function callLLM(
  system: string,
  user: string,
  temperature = 0.4,
): Promise<LLMResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";
  const tokensIn: number = data.usage?.prompt_tokens ?? 0;
  const tokensOut: number = data.usage?.completion_tokens ?? 0;
  const p = priceFor(MODEL);
  const costUsd = (tokensIn / 1000) * p.in + (tokensOut / 1000) * p.out;
  return { content, tokensIn, tokensOut, costUsd };
}

interface TavilyResult {
  text: string;
  raw: unknown;
}

async function callTavily(query: string): Promise<TavilyResult> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) throw new Error("TAVILY_API_KEY is not set");

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ query, max_results: 5, search_depth: "basic" }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tavily ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const results: Array<{ title: string; url: string; content: string }> =
    data.results ?? [];
  const text = results
    .map(
      (r, i) => `[${i + 1}] ${r.title} — ${r.content?.slice(0, 180)} (${r.url})`,
    )
    .join("\n");
  return { text: text || "No results.", raw: data };
}

function extractJson(s: string): Record<string, unknown> | null {
  const match = s.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

/**
 * Runs a real Researcher -> Analyst -> Writer -> Judge swarm, instrumenting
 * every LLM and tool call into a telemetryZero Trace.
 */
export async function runSwarm(task: string): Promise<Trace> {
  const t0 = Date.now();
  const now = () => Date.now() - t0;
  const spans: Span[] = [];
  let idc = 0;
  const nid = () => `live-${Date.now().toString(36)}-${++idc}`;

  let totalTokens = 0;
  let totalCost = 0;
  let traceStatus: Trace["status"] = "ok";

  const track = (r: LLMResult) => {
    totalTokens += r.tokensIn + r.tokensOut;
    totalCost += r.costUsd;
  };

  // helper to add an agent wrapper span we can back-fill
  function agentSpan(agent: string): Span {
    const s: Span = {
      id: nid(),
      parentId: null,
      agent,
      kind: "agent",
      name: agent,
      status: "ok",
      startMs: now(),
      durationMs: 0,
    };
    spans.push(s);
    return s;
  }

  let evalScore: EvalScore | undefined;

  try {
    // ---------- Researcher ----------
    const researcher = agentSpan("Researcher");

    let s = now();
    const plan = await callLLM(
      "You are the Researcher in a multi-agent system. Given a task, produce ONE concise web-search query that will best help. Respond with ONLY the query text, no quotes.",
      `TASK: ${task}`,
      0.2,
    );
    track(plan);
    const query = plan.content.trim().replace(/^["']|["']$/g, "").slice(0, 200);
    spans.push({
      id: nid(),
      parentId: researcher.id,
      agent: "Researcher",
      kind: "llm",
      name: `${MODEL} · plan`,
      status: "ok",
      startMs: s,
      durationMs: now() - s,
      tokensIn: plan.tokensIn,
      tokensOut: plan.tokensOut,
      costUsd: plan.costUsd,
      input: `TASK: ${task}`,
      output: `Search query: ${query}`,
    });

    s = now();
    const search = await callTavily(query);
    spans.push({
      id: nid(),
      parentId: researcher.id,
      agent: "Researcher",
      kind: "tool",
      name: "tavily.search",
      status: "ok",
      startMs: s,
      durationMs: now() - s,
      input: JSON.stringify({ query, max_results: 5 }),
      output: search.text,
    });

    s = now();
    const synth = await callLLM(
      "You are the Researcher. Summarize the raw search results into 3-5 factual, source-grounded bullet points relevant to the task. Do not invent facts.",
      `TASK: ${task}\n\nSEARCH RESULTS:\n${search.text}`,
    );
    track(synth);
    spans.push({
      id: nid(),
      parentId: researcher.id,
      agent: "Researcher",
      kind: "llm",
      name: `${MODEL} · synthesize`,
      status: "ok",
      startMs: s,
      durationMs: now() - s,
      tokensIn: synth.tokensIn,
      tokensOut: synth.tokensOut,
      costUsd: synth.costUsd,
      input: "Summarize search results into grounded bullets.",
      output: synth.content,
    });
    researcher.durationMs = now() - researcher.startMs;

    // ---------- Analyst ----------
    const analyst = agentSpan("Analyst");
    s = now();
    const analyze = await callLLM(
      "You are the Analyst. Given the task and the Researcher's grounded notes, extract the key comparative insights and structure them. Only use provided facts.",
      `TASK: ${task}\n\nRESEARCHER NOTES:\n${synth.content}`,
    );
    track(analyze);
    spans.push({
      id: nid(),
      parentId: analyst.id,
      agent: "Analyst",
      kind: "llm",
      name: `${MODEL} · analyze`,
      status: "ok",
      startMs: s,
      durationMs: now() - s,
      tokensIn: analyze.tokensIn,
      tokensOut: analyze.tokensOut,
      costUsd: analyze.costUsd,
      input: "Extract comparative insights from researcher notes.",
      output: analyze.content,
    });
    analyst.durationMs = now() - analyst.startMs;

    // ---------- Writer ----------
    const writer = agentSpan("Writer");
    s = now();
    const draft = await callLLM(
      "You are the Writer. Using ONLY the analysis provided, write the final answer to the task. Be concise, well-structured, and do not add facts that are not in the analysis.",
      `TASK: ${task}\n\nANALYSIS:\n${analyze.content}`,
    );
    track(draft);
    spans.push({
      id: nid(),
      parentId: writer.id,
      agent: "Writer",
      kind: "llm",
      name: `${MODEL} · draft`,
      status: "ok",
      startMs: s,
      durationMs: now() - s,
      tokensIn: draft.tokensIn,
      tokensOut: draft.tokensOut,
      costUsd: draft.costUsd,
      input: "Write the final answer using only the analysis.",
      output: draft.content,
    });
    writer.durationMs = now() - writer.startMs;

    // ---------- Judge (eval) ----------
    s = now();
    const judge = await callLLM(
      'You are a strict evaluator. Given the task and the final answer, grade it. Respond with ONLY a JSON object: {"overall": 0-100, "correctness": 0-100, "relevance": 0-100, "reasoning": "one sentence"}.',
      `TASK: ${task}\n\nFINAL ANSWER:\n${draft.content}`,
      0,
    );
    track(judge);
    const parsed = extractJson(judge.content);
    evalScore = {
      overall: Number(parsed?.overall ?? 75),
      correctness: Number(parsed?.correctness ?? 75),
      relevance: Number(parsed?.relevance ?? 80),
      reasoning: String(parsed?.reasoning ?? judge.content.slice(0, 200)),
    };
    spans.push({
      id: nid(),
      parentId: null,
      agent: "Judge",
      kind: "eval",
      name: "LLM-as-judge",
      status: "ok",
      startMs: s,
      durationMs: now() - s,
      input: "Grade the final answer for correctness and relevance.",
      output: `overall ${evalScore.overall}/100 — ${evalScore.reasoning}`,
    });
  } catch (err) {
    traceStatus = "error";
    const message = err instanceof Error ? err.message : String(err);
    // attach the failure to the most recent span, or add a synthetic one
    const last = spans[spans.length - 1];
    if (last && last.status !== "error") {
      last.status = "error";
      last.error = message;
      last.failureType = message.toLowerCase().includes("tavily")
        ? "tool_error"
        : "llm_error";
    } else {
      spans.push({
        id: nid(),
        parentId: null,
        agent: "System",
        kind: "tool",
        name: "runtime",
        status: "error",
        startMs: now(),
        durationMs: 0,
        error: message,
        failureType: "runtime_error",
      });
    }
    // propagate error status up to any open agent wrapper
    for (const sp of spans) {
      if (sp.kind === "agent" && sp.durationMs === 0) {
        sp.status = "error";
        sp.durationMs = now() - sp.startMs;
      }
    }
  }

  const totalMs = now();
  const trace: Trace = {
    id: `trace-live-${Date.now().toString(36)}`,
    title: `Live · ${task.slice(0, 42)}${task.length > 42 ? "…" : ""}`,
    createdAt: new Date().toISOString(),
    task,
    status: traceStatus,
    totalMs,
    totalCostUsd: Number(totalCost.toFixed(6)),
    totalTokens,
    agents: ["Researcher", "Analyst", "Writer"],
    spans,
    eval: evalScore,
  };
  return trace;
}
