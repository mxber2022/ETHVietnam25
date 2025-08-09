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
      <div className="bg-gradient-to-r from-black/30 to-[var(--app-card-bg)]/95 border border-[var(--app-accent)] shadow-xl rounded-full p-1.5 flex items-center gap-1.5 backdrop-blur">
        {tabs.map((t) => {
          const active = pathname?.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-label={t.label}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors min-w-[40px] min-h-[40px] ${
                active
                  ? "bg-[var(--app-accent-light)] text-[var(--app-foreground)]"
                  : "text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
              }`}
            >
              <Icon name={t.icon} />
              <span className="text-sm hidden sm:inline">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


