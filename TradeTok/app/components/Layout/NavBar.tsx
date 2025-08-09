"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string; icon: "home" | "plus" | "pie" };

const tabs: Tab[] = [
  { href: "/feed", label: "Feed", icon: "home" },
  { href: "/strategies/new", label: "Create", icon: "plus" },
  { href: "/portfolio", label: "Portfolio", icon: "pie" },
];

function Icon({ name }: { name: Tab["icon"] }) {
  if (name === "home")
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 11l9-8 9 8" /><path d="M4 10v10a1 1 0 0 0 1 1h5v-6h4v6h5a1 1 0 0 0 1-1V10" />
      </svg>
    );
  if (name === "plus")
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    );
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12A9 9 0 1 1 12 3v9z" />
    </svg>
  );
}

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed z-50 left-1/2 -translate-x-1/2 bottom-[calc(env(safe-area-inset-bottom)+16px)]">
      <div className="relative bg-gradient-to-r from-black/25 via-black/10 to-transparent border border-black/20 ring-1 ring-white/10 ring-inset shadow-[0_6px_20px_rgba(0,0,0,0.12)] rounded-full p-1.5 flex items-center gap-1.5 backdrop-blur-lg backdrop-saturate-200 overflow-hidden bg-clip-padding">
        <div className="pointer-events-none absolute top-0.5 left-2 right-2 h-2 rounded-full bg-gradient-to-r from-white/25 via-white/10 to-transparent blur-sm opacity-50" />
        {tabs.map((t, i) => {
          const active = pathname?.startsWith(t.href);
          return (
            <div key={t.href} className="flex items-center">
              <Link
                href={t.href}
                aria-label={t.label}
                className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 min-w-[40px] min-h-[40px] hover:backdrop-brightness-110 active:scale-95 ${
                  active
                    ? "bg-[var(--app-accent-light)] text-[var(--app-foreground)] ring-1 ring-[var(--app-accent)]/30"
                    : "text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
                }`}
              >
                <Icon name={t.icon} />
                <span className="text-sm hidden sm:inline">{t.label}</span>
              </Link>
              {i < tabs.length - 1 && (
                <div className="mx-1 h-6 w-px bg-white/10" />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}


