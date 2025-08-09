import { NextResponse } from "next/server";
import type { CopyTradeRequest, CopyTradeResponse } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CopyTradeRequest;

    if (!body.strategyId || body.sizePct <= 0) {
      const res: CopyTradeResponse = { success: false, error: "Invalid params" };
      return NextResponse.json(res, { status: 400 });
    }

    // TODO: route to on-chain CopyTrading contract via viem
    const res: CopyTradeResponse = { success: true, txHash: undefined };
    return NextResponse.json(res, { status: 200 });
  } catch (e) {
    const res: CopyTradeResponse = { success: false, error: "Bad request" };
    return NextResponse.json(res, { status: 400 });
  }
}


