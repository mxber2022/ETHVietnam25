import { NextResponse } from "next/server";

const API_BASE_URL = "https://trading.ai.zircuit.com/api/engine/v1";
const API_KEY = "ETHVietnam2025"; // hardcoded per request

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.info("[trade/estimate] request", {
      srcChainId: body?.srcChainId,
      destChainId: body?.destChainId,
      srcToken: body?.srcToken,
      destToken: body?.destToken,
      slippageBps: body?.slippageBps,
      hasUserAccount: Boolean(body?.userAccount),
      hasDestReceiver: Boolean(body?.destReceiver),
    });

    const res = await fetch(`${API_BASE_URL}/order/estimate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn("[trade/estimate] upstream error", res.status, text);
      return NextResponse.json({ error: text || res.statusText }, { status: 400 });
    }

    const json = await res.json();
    console.info("[trade/estimate] response", {
      status: res.status,
      hasData: Boolean(json?.data),
      tradeId: json?.data?.trade?.tradeId,
      min: json?.data?.trade?.destTokenMinAmount,
      expected: json?.data?.trade?.destTokenAmount,
    });
    return NextResponse.json(json, { status: 200 });
  } catch (e) {
    console.error("[trade/estimate] exception", e);
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}


