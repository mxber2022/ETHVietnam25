export type RiskLevel = "Low" | "Medium" | "High";

export type Creator = {
  address: `0x${string}`;
  name: string;
  avatarUrl?: string;
};

export type StrategyPerformance = {
  returnPct: number; // total return percentage
  winRatePct: number; // 0-100
};

export type Strategy = {
  id: string;
  title: string;
  description?: string;
  creator: Creator;
  tokenSymbol: string;
  tokenAddress?: `0x${string}`;
  riskLevel: RiskLevel;
  entry?: number; // optional for perps
  exit?: number;
  stopLoss?: number;
  createdAt: string; // ISO string
  videoUrl?: string;
  performance: StrategyPerformance;
};

export type CopyTradeRequest = {
  strategyId: string;
  sizePct: number;
  slippageBps: number;
  maxDailyLossUsd?: number;
  leverage?: number; // optional for perps
};

export type CopyTradeResponse = {
  success: true;
  txHash?: string;
} | {
  success: false;
  error: string;
};


