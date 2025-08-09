import type { Strategy } from "@/lib/types";

export const mockStrategies: Strategy[] = [
  {
    id: "strat_eth_momentum",
    title: "ETH Momentum Scalps",
    description: "15m trend following on ETH with tight stops",
    creator: {
      address: "0x1111111111111111111111111111111111111111",
      name: "AlphaCat",
      avatarUrl: "/icon.png",
    },
    tokenSymbol: "ETH",
    riskLevel: "Medium",
    entry: 0,
    exit: 0,
    stopLoss: 1.5,
    createdAt: new Date().toISOString(),
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    performance: {
      returnPct: 42.4,
      winRatePct: 58,
    },
    
  },
  {
    id: "strat_btc_breakout",
    title: "BTC Breakout",
    description: "Daily close range breakouts with 2% SL",
    creator: {
      address: "0x2222222222222222222222222222222222222222",
      name: "ChainWhale",
      avatarUrl: "/logo.png",
    },
    tokenSymbol: "BTC",
    riskLevel: "High",
    entry: 0,
    exit: 0,
    stopLoss: 2,
    createdAt: new Date().toISOString(),
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    performance: {
      returnPct: 120.2,
      winRatePct: 47,
    },
    
  },
  {
    id: "strat_sol_mean_reversion",
    title: "SOL Mean Reversion",
    description: "RSI(2) pullbacks on SOL/USDC",
    creator: {
      address: "0x3333333333333333333333333333333333333333",
      name: "StatArbJoe",
      avatarUrl: "/icon.png",
    },
    tokenSymbol: "SOL",
    riskLevel: "Low",
    entry: 0,
    exit: 0,
    stopLoss: 1,
    createdAt: new Date().toISOString(),
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    performance: {
      returnPct: 18.6,
      winRatePct: 65,
    },
    
  },
];


