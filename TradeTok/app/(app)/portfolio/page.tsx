"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount, useBalance } from "wagmi";

type Activity = { id?: string; qtyEth: string; ts: number };

export default function PortfolioPage() {
  const [activity, setActivity] = useState<Activity[]>([]);
  const [copied, setCopied] = useState(false);
  const { address } = useAccount();
  const { data: balance } = useBalance({ address, chainId: 8453 });

  async function copyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("copyActivity");
      if (raw) setActivity(JSON.parse(raw));
    } catch {}
  }, []);

  const stats = useMemo(() => {
    const strategies = new Set(activity.map((a) => a.id).filter(Boolean));
    const totalQty = activity.reduce((acc, a) => acc + (Number(a.qtyEth) || 0), 0);
    return { strategies: strategies.size, totalQty };
  }, [activity]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">My Portfolio</h2>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-md border border-[var(--app-card-border)] bg-[var(--app-card-bg)]">
          <div className="text-[10px] text-[var(--app-foreground-muted)]">Wallet</div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium break-all">
              {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Not connected"}
            </div>
            {address && (
              <button
                type="button"
                onClick={copyAddress}
                className="rounded-full w-8 h-8 grid place-items-center border border-[var(--app-card-border)] hover:bg-[var(--app-accent-light)]"
                aria-label="Copy address"
                title="Copy address"
              >
                {copied ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
        <div className="p-3 rounded-md border border-[var(--app-card-border)] bg-[var(--app-card-bg)]">
          <div className="text-[10px] text-[var(--app-foreground-muted)]">ETH Balance</div>
          <div className="text-sm font-medium">{balance ? `${balance.formatted.slice(0, 8)} ${balance.symbol}` : "–"}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-md border border-[var(--app-card-border)] bg-[var(--app-card-bg)]">
          <div className="text-[10px] text-[var(--app-foreground-muted)]">Strategies</div>
          <div className="text-base font-semibold">{stats.strategies}</div>
        </div>
        <div className="p-3 rounded-md border border-[var(--app-card-border)] bg-[var(--app-card-bg)]">
          <div className="text-[10px] text-[var(--app-foreground-muted)]">Total Copied (ETH)</div>
          <div className="text-base font-semibold">{stats.totalQty.toFixed(4)}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-[var(--app-foreground-muted)]">Recent activity</div>
        {activity.length === 0 ? (
          <div className="text-xs text-[var(--app-foreground-muted)]">No copy trades yet. Go to <Link href="/feed" className="underline">Feed</Link>.</div>
        ) : (
          <ul className="space-y-2">
            {activity.slice().reverse().map((a, i) => (
              <li key={i} className="flex items-center justify-between p-3 rounded-md border border-[var(--app-card-border)] bg-[var(--app-card-bg)]">
                <div className="text-sm">Copied {a.qtyEth} ETH</div>
                <div className="text-[10px] text-[var(--app-foreground-muted)]">{new Date(a.ts).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


