import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { STRATEGY_REGISTRY_ADDRESS, STRATEGY_REGISTRY_ABI } from "@/lib/contracts/strategyRegistry";

type ApiStrategy = {
  id: string;
  title: string;
  videoUrl: string;
  riskLevel: "Low" | "Medium" | "High";
  tokenAddress: `0x${string}` | null;
  tokenSymbol: string | null;
  tokenName: string | null;
  priceUsd: number | null;
  entryMinUsd: number;
  entryMaxUsd: number;
  createdAt: string;
  active: boolean;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rpcUrl = process.env.BASE_RPC_URL || process.env.NEXT_PUBLIC_BASE_RPC_URL;
    const client = createPublicClient({ chain: base, transport: http(rpcUrl) });

    let total = 0n;
    try {
      total = (await client.readContract({
        address: STRATEGY_REGISTRY_ADDRESS,
        abi: STRATEGY_REGISTRY_ABI as any,
        functionName: "totalStrategies",
        args: [],
      })) as bigint;
    } catch (e) {
      console.error("totalStrategies failed", e);
      return NextResponse.json({ strategies: [] }, { status: 200 });
    }

    const max = Number(total);
    if (!Number.isFinite(max) || max <= 0) {
      return NextResponse.json({ strategies: [] }, { status: 200 });
    }

    const limit = Math.min(10, max); // fetch latest up to 10 to avoid RPC limits
    const start = Math.max(0, max - limit);

    let page: any[] = [];
    try {
      page = (await client.readContract({
        address: STRATEGY_REGISTRY_ADDRESS,
        abi: STRATEGY_REGISTRY_ABI as any,
        functionName: "listStrategies",
        args: [BigInt(start), BigInt(limit)],
      })) as any[];
    } catch (e) {
      console.error("listStrategies failed", e);
      return NextResponse.json({ strategies: [] }, { status: 200 });
    }

    const results: ApiStrategy[] = page.map((s: any, idx: number) => {
      const id = start + idx;
      const riskIdx = Number(s.risk || s[4] || 0);
      const risk: ApiStrategy["riskLevel"] = riskIdx === 0 ? "Low" : riskIdx === 1 ? "Medium" : "High";
      const entryMinRaw = (s.entryMinUsd ?? s[5] ?? 0n) as bigint;
      const entryMaxRaw = (s.entryMaxUsd ?? s[6] ?? 0n) as bigint;
      const tokenAddr = ((s.token ?? s[3]) as string | undefined)?.toLowerCase() as `0x${string}` | undefined;

      return {
        id: String(id),
        title: (s.title || s[1]) as string,
        videoUrl: (s.uri || s[2]) as string,
        riskLevel: risk,
        tokenAddress: (tokenAddr && tokenAddr !== "0x0000000000000000000000000000000000000000") ? (tokenAddr as `0x${string}`) : null,
        tokenSymbol: null,
        tokenName: null,
        priceUsd: null,
        entryMinUsd: Number(entryMinRaw) / 1_000_000,
        entryMaxUsd: Number(entryMaxRaw) / 1_000_000,
        createdAt: new Date(Number(s.createdAt || s[8] || 0) * 1000).toISOString(),
        active: Boolean(s.active || s[9]),
      } as ApiStrategy;
    });

    // Enrich with token metadata + price
    const KNOWN_TOKENS: Record<string, { symbol: string; name: string; coingeckoId: string }> = {
      // Base WETH
      "0x4200000000000000000000000000000000000006": { symbol: "WETH", name: "Wrapped Ether", coingeckoId: "ethereum" },
      // Base USDC (optional reference)
      "0x833589fcd6edb6e08f4c7c32d4f71b54b68aed18": { symbol: "USDC", name: "USD Coin", coingeckoId: "usd-coin" },
    };

    const idsSet = new Set<string>();
    for (const r of results) {
      if (r.tokenAddress && KNOWN_TOKENS[r.tokenAddress]) {
        const meta = KNOWN_TOKENS[r.tokenAddress];
        r.tokenSymbol = meta.symbol;
        r.tokenName = meta.name;
        idsSet.add(meta.coingeckoId);
      } else {
        // Fallback assume ETH if unknown address
        r.tokenSymbol = r.tokenSymbol ?? "ETH";
        r.tokenName = r.tokenName ?? "Ether";
        idsSet.add("ethereum");
      }
    }

    try {
      if (idsSet.size > 0) {
        const ids = Array.from(idsSet).join(",");
        const priceRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`, {
          next: { revalidate: 30 },
          headers: { "accept": "application/json" },
        });
        const prices = await priceRes.json();
        for (const r of results) {
          const id = (r.tokenSymbol === "USDC") ? "usd-coin" : "ethereum";
          if (r.tokenAddress && KNOWN_TOKENS[r.tokenAddress]) {
            const meta = KNOWN_TOKENS[r.tokenAddress];
            r.priceUsd = prices?.[meta.coingeckoId]?.usd ?? null;
          } else {
            r.priceUsd = prices?.[id]?.usd ?? null;
          }
        }
      }
    } catch {}

    const active = results.filter((r) => r.active && r.videoUrl);
    // newest first
    active.sort((a, b) => (a.id < b.id ? 1 : -1));

    return NextResponse.json({ strategies: active }, { status: 200 });
  } catch (e) {
    console.error("/api/strategies fatal", e);
    return NextResponse.json({ strategies: [] }, { status: 200 });
  }
}


