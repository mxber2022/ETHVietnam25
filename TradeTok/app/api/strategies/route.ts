import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { STRATEGY_REGISTRY_ADDRESS, STRATEGY_REGISTRY_ABI } from "@/lib/contracts/strategyRegistry";

type ApiStrategy = {
  id: string;
  title: string;
  videoUrl: string;
  riskLevel: "Low" | "Medium" | "High";
  createdAt: string;
  active: boolean;
};

export async function GET() {
  try {
    const client = createPublicClient({ chain: base, transport: http() });

    const total = (await client.readContract({
      address: STRATEGY_REGISTRY_ADDRESS,
      abi: STRATEGY_REGISTRY_ABI as any,
      functionName: "totalStrategies",
      args: [],
    })) as bigint;

    const max = Number(total);
    const start = Math.max(0, max - 25); // fetch latest up to 25

    const reads = Array.from({ length: max - start }, (_, i) => start + i).map(async (id) => {
      const s = (await client.readContract({
        address: STRATEGY_REGISTRY_ADDRESS,
        abi: STRATEGY_REGISTRY_ABI as any,
        functionName: "getStrategy",
        args: [BigInt(id)],
      })) as any;

      const riskIdx = Number(s.risk || s[4] || 0);
      const risk: ApiStrategy["riskLevel"] = riskIdx === 0 ? "Low" : riskIdx === 1 ? "Medium" : "High";

      return {
        id: String(id),
        title: (s.title || s[1]) as string,
        videoUrl: (s.uri || s[2]) as string,
        riskLevel: risk,
        createdAt: new Date(Number(s.createdAt || s[8] || 0) * 1000).toISOString(),
        active: Boolean(s.active || s[9]),
      } as ApiStrategy;
    });

    const results = await Promise.all(reads);
    const active = results.filter((r) => r.active && r.videoUrl);
    // newest first
    active.sort((a, b) => (a.id < b.id ? 1 : -1));

    return NextResponse.json({ strategies: active }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "failed_to_load" }, { status: 500 });
  }
}


