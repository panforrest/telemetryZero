import Link from "next/link";

export function Header({ active }: { active?: "home" | "explorer" }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-canvas/80 px-5 backdrop-blur">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="tz-live-dot h-2.5 w-2.5 rounded-full bg-ok" />
        <span className="font-mono text-sm font-semibold tracking-tight text-zinc-100">
          telemetry<span className="text-ok">Zero</span>
        </span>
        <span className="ml-1 hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500 sm:inline">
          agent flight recorder
        </span>
      </Link>

      <nav className="flex items-center gap-1 font-mono text-xs">
        <Link
          href="/"
          className={`rounded-md px-3 py-1.5 transition-colors ${
            active === "home"
              ? "bg-panel-2 text-zinc-100"
              : "text-zinc-500 hover:text-zinc-200"
          }`}
        >
          overview
        </Link>
        <Link
          href="/explorer"
          className={`rounded-md px-3 py-1.5 transition-colors ${
            active === "explorer"
              ? "bg-panel-2 text-zinc-100"
              : "text-zinc-500 hover:text-zinc-200"
          }`}
        >
          trace explorer
        </Link>
        <a
          href="https://github.com/panforrest/telemetryZero"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md px-3 py-1.5 text-zinc-500 transition-colors hover:text-zinc-200"
        >
          github ↗
        </a>
      </nav>
    </header>
  );
}
