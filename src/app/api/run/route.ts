import { NextResponse } from "next/server";
import { runSwarm } from "@/lib/agent";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let task = "";
  try {
    const body = await req.json();
    task = (body?.task ?? "").toString().trim();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!task) {
    return NextResponse.json({ error: "Missing 'task'" }, { status: 400 });
  }

  const missing: string[] = [];
  if (!process.env.OPENAI_API_KEY) missing.push("OPENAI_API_KEY");
  if (!process.env.TAVILY_API_KEY) missing.push("TAVILY_API_KEY");
  if (missing.length) {
    return NextResponse.json(
      {
        error: `Missing env var(s): ${missing.join(", ")}. Add them to .env.local (and Vercel project settings) to run a live agent.`,
      },
      { status: 400 },
    );
  }

  try {
    const trace = await runSwarm(task);
    return NextResponse.json({ trace });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Agent run failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
