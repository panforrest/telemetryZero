import { Header } from "@/components/Header";

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-line px-3 py-2">
      <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
        {children}
      </span>
    </div>
  );
}

function SkeletonRow({ w = "w-full", dim = 0.5 }: { w?: string; dim?: number }) {
  return (
    <div
      className={`h-2.5 rounded ${w} bg-line`}
      style={{ opacity: dim }}
    />
  );
}

export default function ExplorerPage() {
  return (
    <div className="flex h-screen min-h-full flex-col">
      <Header active="explorer" />

      {/* workspace toolbar */}
      <div className="flex items-center justify-between border-b border-line bg-panel px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-zinc-500">run</span>
          <span className="font-mono text-sm text-zinc-300">— no run selected —</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled
            className="flex h-8 items-center gap-2 rounded-md bg-ok px-3 font-mono text-xs font-medium text-[#03130d] opacity-60"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#03130d]" />
            run agent
          </button>
          <button
            disabled
            className="flex h-8 items-center gap-2 rounded-md border border-line px-3 font-mono text-xs text-zinc-400 opacity-60"
          >
            ⏮ replay
          </button>
        </div>
      </div>

      {/* 3-panel body */}
      <div className="grid flex-1 grid-cols-[260px_1fr_340px] overflow-hidden">
        {/* LEFT: runs + span tree */}
        <aside className="tz-scroll flex flex-col overflow-y-auto border-r border-line bg-panel">
          <PanelLabel>runs</PanelLabel>
          <div className="flex flex-col gap-1 p-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-lg border border-line bg-canvas px-3 py-2.5"
                style={{ opacity: 1 - i * 0.25 }}
              >
                <SkeletonRow w="w-3/4" dim={0.6} />
                <SkeletonRow w="w-1/2" dim={0.35} />
              </div>
            ))}
          </div>

          <PanelLabel>span tree</PanelLabel>
          <div className="flex flex-col gap-3 p-3">
            {[
              "w-2/3",
              "w-4/5",
              "w-3/5",
              "w-3/4",
              "w-1/2",
              "w-4/5",
            ].map((w, i) => (
              <div
                key={i}
                className="flex items-center gap-2"
                style={{ paddingLeft: (i % 3) * 12 }}
              >
                <span className="h-2 w-2 shrink-0 rounded-sm bg-line" />
                <SkeletonRow w={w} dim={0.4} />
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER: timeline waterfall */}
        <main className="tz-grid relative flex flex-col overflow-hidden bg-canvas">
          <PanelLabel>tool-call timeline</PanelLabel>
          <div className="relative flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-panel font-mono text-2xl text-ok">
              ⚙
            </div>
            <div className="max-w-sm">
              <h2 className="text-base font-semibold text-zinc-200">
                No trace loaded yet
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-zinc-500">
                Run a live agent swarm or load a demo trace to see the tool-call
                waterfall, latency, tokens, and cost — step by step.
              </p>
            </div>
            <div className="mt-2 flex gap-3">
              <button
                disabled
                className="flex h-9 items-center gap-2 rounded-md bg-ok px-4 font-mono text-xs font-medium text-[#03130d] opacity-60"
              >
                run agent
              </button>
              <button
                disabled
                className="flex h-9 items-center rounded-md border border-line px-4 font-mono text-xs text-zinc-400 opacity-60"
              >
                load demo trace
              </button>
            </div>
            <p className="mt-4 font-mono text-[11px] text-zinc-600">
              step 2 of 8 · shell online · seed traces + live viewer land in step 3
            </p>
          </div>
        </main>

        {/* RIGHT: inspector */}
        <aside className="tz-scroll flex flex-col overflow-y-auto border-l border-line bg-panel">
          <PanelLabel>inspector</PanelLabel>
          <div className="flex flex-col gap-5 p-4">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                prompt / input
              </span>
              <div className="flex flex-col gap-2 rounded-lg border border-line bg-canvas p-3">
                <SkeletonRow w="w-full" dim={0.3} />
                <SkeletonRow w="w-5/6" dim={0.3} />
                <SkeletonRow w="w-2/3" dim={0.3} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                output
              </span>
              <div className="flex flex-col gap-2 rounded-lg border border-line bg-canvas p-3">
                <SkeletonRow w="w-3/4" dim={0.3} />
                <SkeletonRow w="w-full" dim={0.3} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["tokens", "latency", "cost"].map((m) => (
                <div
                  key={m}
                  className="rounded-lg border border-line bg-canvas p-2.5 text-center"
                >
                  <div className="font-mono text-sm text-zinc-500">—</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                    {m}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
