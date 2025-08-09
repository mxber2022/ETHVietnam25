import { NextResponse } from "next/server";

const API_BASE_URL = "https://trading.ai.zircuit.com/api/engine/v1";
const API_KEY = "ETHVietnam2025"; // hardcoded per request

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const txHash = searchParams.get("txHash");
    if (!txHash) {
      return NextResponse.json({ error: "missing_params" }, { status: 400 });
    }

    const res = await fetch(`${API_BASE_URL}/order/status?txHash=${txHash}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    const json = await res.json();
    console.info("[trade/status] tx", txHash, "status", res.status, json?.status || json?.data?.status);
    return NextResponse.json(json, { status: 200 });
  } catch (e) {
    console.error("[trade/status] exception", e);
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}


