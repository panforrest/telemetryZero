export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#0B0E14] px-6 text-center font-sans text-zinc-100">
      {/* grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <main className="relative z-10 flex max-w-2xl flex-col items-center gap-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 font-mono text-xs uppercase tracking-widest text-emerald-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          system online · skeleton deploy
        </span>
        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
          telemetry<span className="text-emerald-400">Zero</span>
        </h1>
        <p className="max-w-xl text-lg leading-8 text-zinc-400">
          The flight recorder &amp; time machine for AI agent swarms. Trace every
          tool call, replay any run, diff the prompt, and watch a failing agent
          recover — live.
        </p>
        <p className="font-mono text-xs text-zinc-600">
          Step 1 of 8 · scaffold deployed · full mission-control UI incoming
        </p>
      </main>
    </div>
  );
}
