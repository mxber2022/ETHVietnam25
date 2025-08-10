import { notFound } from "next/navigation";
import { mockStrategies } from "@/lib/mock";
import Link from "next/link";

export default async function StrategyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const strat = mockStrategies.find((s) => s.id === id);
  if (!strat) return notFound();
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold leading-tight">{strat.title}</h1>
      <div className="text-xs text-[var(--app-foreground-muted)]">
        {strat.tokenSymbol} • {strat.riskLevel} • by {strat.creator.name}
      </div>
      {strat.description && <p className="text-xs text-[var(--app-foreground-muted)]">{strat.description}</p>}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-2.5 rounded-md border border-[var(--app-card-border)] bg-[var(--app-card-bg)]">
          <div className="text-[10px] text-[var(--app-foreground-muted)]">Return</div>
          <div className="text-base font-semibold">{strat.performance.returnPct.toFixed(1)}%</div>
        </div>
        <div className="p-2.5 rounded-md border border-[var(--app-card-border)] bg-[var(--app-card-bg)]">
          <div className="text-[10px] text-[var(--app-foreground-muted)]">Win rate</div>
          <div className="text-base font-semibold">{strat.performance.winRatePct}%</div>
        </div>
        {/* third slot reserved for future metric */}
      </div>
      <div className="flex gap-2">
        <Link href={`/strategies/${strat.id}/copy`} className="flex-1 text-center bg-[var(--app-accent)] text-[var(--app-background)] rounded-md py-2 text-sm font-medium hover:bg-[var(--app-accent-hover)]">
          Copy Trade
        </Link>
        <Link href="/feed" className="flex-1 text-center border border-[var(--app-card-border)] rounded-md py-2 text-sm font-medium">Back</Link>
      </div>
    </div>
  );
}


