"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAccount, useChainId, useSwitchChain, useWalletClient } from "wagmi";
import { createPublicClient, http, erc20Abi, parseEther, encodeFunctionData } from "viem";
import { base, mainnet, optimism, arbitrum } from "viem/chains";
import {
  Transaction,
  TransactionButton,
  TransactionToast,
  TransactionToastAction,
  TransactionToastIcon,
  TransactionToastLabel,
  type TransactionError,
  type TransactionResponse,
} from "@coinbase/onchainkit/transaction";
import Link from "next/link";
import { createPortal } from "react-dom";

export default function CopyPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { address } = useAccount();
  const currentChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const [quantityEth, setQuantityEth] = useState<string>("");
  const [amountUsdc, setAmountUsdc] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [estimate, setEstimate] = useState<any | null>(null);
  const [src, setSrc] = useState<{ chainId: number; token: `0x${string}` } | null>(null);
  const [needsApproval, setNeedsApproval] = useState<boolean>(false);
  const [spender, setSpender] = useState<`0x${string}` | null>(null);
  const [execTx, setExecTx] = useState<{ to: `0x${string}`; data: `0x${string}`; value: bigint; chainId: number } | null>(null);
  const [executing, setExecuting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  // Monitor chain changes
  useEffect(() => {
    if (mounted && src && currentChainId === src.chainId) {
      console.log('[chain] successfully switched to', currentChainId);
      setSwitchError(null);
      setSwitching(false);
    }
  }, [mounted, src, currentChainId]);

  const isValidQty = useMemo(() => {
    const n = Number(quantityEth);
    return Number.isFinite(n) && n > 0;
  }, [quantityEth]);

  const isValidAmount = useMemo(() => {
    const n = Number(amountUsdc);
    return Number.isFinite(n) && n > 0;
  }, [amountUsdc]);

  const USDC_ADDRESSES: Record<number, `0x${string}`> = {
    8453: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // Base USDC
    1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Mainnet USDC
    10: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // Optimism USDC
    42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum USDC
  };

  async function getUsdcBalance(chainId: number, user: `0x${string}`): Promise<bigint> {
    const chain = chainId === 8453 ? base : chainId === 1 ? mainnet : chainId === 10 ? optimism : chainId === 42161 ? arbitrum : base;
    const rpc = chainId === 8453
      ? (process.env.NEXT_PUBLIC_BASE_RPC || "https://base-mainnet.g.alchemy.com/v2/kaFl069xyvy3np41aiUXwjULZrF67--t")
      : chainId === 10
      ? (process.env.NEXT_PUBLIC_OPTIMISM_RPC || "https://opt-mainnet.g.alchemy.com/v2/kaFl069xyvy3np41aiUXwjULZrF67--t")
      : undefined;
    const client = createPublicClient({ chain, transport: http(rpc) });
    const token = USDC_ADDRESSES[chainId];
    return await client.readContract({ address: token, abi: erc20Abi, functionName: "balanceOf", args: [user] });
  }

  async function findSourceChainForUsdc(amountMicro: bigint, user: `0x${string}`): Promise<{ chainId: number; token: `0x${string}` } | null> {
    const chains = [8453, 10, 42161, 1];
    for (const cid of chains) {
      try {
        const bal = await getUsdcBalance(cid, user);
        if (bal >= amountMicro) return { chainId: cid, token: USDC_ADDRESSES[cid] };
      } catch {}
    }
    return null;
  }

  async function checkAllowance(chainId: number, token: `0x${string}`, owner: `0x${string}`, spenderAddr: `0x${string}`, amount: bigint) {
    const chain = chainId === 8453 ? base : chainId === 1 ? mainnet : chainId === 10 ? optimism : chainId === 42161 ? arbitrum : base;
    const rpc = chainId === 8453
      ? (process.env.NEXT_PUBLIC_BASE_RPC || "https://base-mainnet.g.alchemy.com/v2/kaFl069xyvy3np41aiUXwjULZrF67--t")
      : chainId === 10
      ? (process.env.NEXT_PUBLIC_OPTIMISM_RPC || "https://opt-mainnet.g.alchemy.com/v2/kaFl069xyvy3np41aiUXwjULZrF67--t")
      : undefined;
    const client = createPublicClient({ chain, transport: http(rpc) });
    const allowance = await client.readContract({ address: token, abi: erc20Abi, functionName: "allowance", args: [owner, spenderAddr] });
    return (allowance as bigint) < amount;
  }

  const calls = useMemo(() => {
    if (!mounted || !address || !isValidQty) return [] as { to: `0x${string}`; data: `0x${string}`; value?: bigint }[];
    try {
      return [
        {
          to: address,
          data: "0x" as `0x${string}`,
          value: parseEther(quantityEth || "0"),
        },
      ];
    } catch {
      return [];
    }
  }, [mounted, address, isValidQty, quantityEth]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Copy Strategy</h2>
        <Link href="/feed" className="text-sm text-[var(--app-foreground-muted)]">Back</Link>
      </div>
      <div className="space-y-3 glass rounded-xl p-3">
        <div>
          <label className="block text-sm mb-1 text-[var(--app-foreground-muted)]">Amount (USDC)</label>
          <input
            inputMode="decimal"
            placeholder="e.g. 100"
            value={amountUsdc}
            onChange={(e) => setAmountUsdc(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-md"
          />
          <p className="mt-1 text-[10px] text-[var(--app-foreground-muted)]"></p>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={!mounted || !address || !isValidAmount}
            onClick={async () => {
              if (!address || !isValidAmount) return;
              try {
                const amountMicro = BigInt(Math.round(Number(amountUsdc) * 1_000_000));
                const srcFound = await findSourceChainForUsdc(amountMicro, address as `0x${string}`);
                if (!srcFound) {
                  setEstimate({ error: "Insufficient USDC across supported chains." });
                  return;
                }
                setSrc(srcFound);
                const res = await fetch("/api/trade/estimate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    srcChainId: srcFound.chainId,
                    srcToken: srcFound.token,
                    srcAmountWei: amountMicro.toString(),
                    destToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH
                    destChainId: 8453,
                    slippageBps: 100,
                    userAccount: address,
                    destReceiver: address,
                  }),
                });
                const j = await res.json();
                console.log("[estimate] http", res.status, res.statusText);
                console.log("[estimate] full", JSON.stringify(j));
                setEstimate(j);
                const toAddr = (j?.data?.tx?.to ?? j?.data?.txData?.to) as `0x${string}` | undefined;
                const dataHex = (j?.data?.tx?.data ?? j?.data?.txData?.data) as `0x${string}` | undefined;
                const valueStr = (j?.data?.tx?.value ?? j?.data?.txData?.value ?? "0") as string;
                if (toAddr && dataHex) {
                  setSpender(toAddr);
                  setExecTx({ to: toAddr, data: dataHex, value: BigInt(valueStr), chainId: srcFound.chainId });
                  const need = await checkAllowance(srcFound.chainId, srcFound.token, address as `0x${string}`, toAddr, amountMicro);
                  setNeedsApproval(need);
                } else {
                  console.warn("[estimate] missing tx fields", { toAddr, dataHex, valueStr });
                }
              } catch (e) {
                console.error("[estimate] error", e);
                setEstimate({ error: String(e) });
              }
            }}
            className="text-xs px-3 py-2 rounded-md border border-[var(--app-card-border)] hover:bg-[var(--app-accent-light)] disabled:opacity-50"
          >
            {mounted && address ? "Find & estimate" : "Connect wallet"}
          </button>
        </div>
        {estimate && (
          <div className="text-[11px] text-[var(--app-foreground-muted)] space-y-1">
            {estimate?.data?.trade ? (
              <>
                <div>TradeId: {estimate.data.trade.tradeId}</div>
                <div>Min expected: {estimate.data.trade.destTokenMinAmount}</div>
                <div>Expected: {estimate.data.trade.destTokenAmount}</div>
                <div>Fees: {Array.isArray(estimate.data.trade.fees) ? estimate.data.trade.fees.map((f: any) => f.amount).join(", ") : "-"}</div>
              </>
            ) : (
              <div className="text-red-500">{estimate.error || estimate.message || "Estimate failed"}</div>
            )}
          </div>
        )}
        {mounted && src && execTx && (
          <div className="space-y-2">
            {currentChainId !== src.chainId && (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={switching}
                  onClick={async () => {
                    if (!src) return;
                    setSwitchError(null);
                    setSwitching(true);
                    try {
                      console.log('[switch] attempting to switch to chain', src.chainId);
                      const result = await switchChainAsync({ chainId: src.chainId });
                      console.log('[switch] switch result', result);
                      // Wait a bit for the switch to take effect
                      setTimeout(() => {
                        console.log('[switch] checking if switch took effect, current chain:', currentChainId);
                        setSwitching(false);
                      }, 2000);
                    } catch (e) {
                      console.warn('[switch] error', e);
                      setSwitchError(`Failed to switch to ${src.chainId === 8453 ? 'Base' : src.chainId === 1 ? 'Mainnet' : src.chainId === 10 ? 'Optimism' : src.chainId === 42161 ? 'Arbitrum' : `Chain ${src.chainId}`}. Please switch manually in your wallet.`);
                      setSwitching(false);
                    }
                  }}
                  className="w-full h-10 rounded-md border border-[var(--app-card-border)] hover:bg-[var(--app-accent-light)] text-sm disabled:opacity-50"
                >
                  {switching ? 'Switching…' : `Switch to ${src.chainId === 8453 ? 'Base' : src.chainId === 1 ? 'Mainnet' : src.chainId === 10 ? 'Optimism' : src.chainId === 42161 ? 'Arbitrum' : `Chain ${src.chainId}`}`}
                </button>
                
                <div className="text-[10px] text-[var(--app-foreground-muted)] text-center">
                  If switching doesn't work, manually change your wallet network to {src.chainId === 8453 ? 'Base' : src.chainId === 1 ? 'Mainnet' : src.chainId === 10 ? 'Optimism' : src.chainId === 42161 ? 'Arbitrum' : `Chain ${src.chainId}`}
                </div>
              </div>
            )}

            {switchError && (
              <div className="space-y-2">
                <div className="text-[11px] text-red-500">{switchError}</div>
                <button
                  type="button"
                  onClick={() => {
                    setSwitchError(null);
                    // Force a re-render to check current chain
                    window.location.reload();
                  }}
                  className="w-full text-xs px-3 py-2 rounded-md border border-[var(--app-card-border)] hover:bg-[var(--app-accent-light)]"
                >
                  Refresh after switching
                </button>
              </div>
            )}

            {needsApproval && currentChainId === src.chainId && (
              <Transaction
                chainId={src.chainId}
                calls={[{
                  to: src.token,
                  data: encodeFunctionData({ abi: erc20Abi, functionName: "approve", args: [spender!, BigInt(Math.round(Number(amountUsdc) * 1_000_000))] }) as `0x${string}`,
                }]}
                onSuccess={() => setNeedsApproval(false)}
                onError={() => {}}
              >
                <TransactionButton className="h-11 w-full rounded-lg bg-[var(--app-accent)] text-[var(--app-background)] text-sm font-medium hover:bg-[var(--app-accent-hover)]" />
                {mounted &&
                  createPortal(
                    <div className="fixed left-1/2 -translate-x-1/2 bottom-[calc(env(safe-area-inset-bottom)+56px)] z-[60] w-[calc(100%-32px)] max-w-md px-2">
                      <TransactionToast className="w-full">
                        <TransactionToastIcon />
                        <TransactionToastLabel />
                        <TransactionToastAction />
                      </TransactionToast>
                    </div>,
                    document.body,
                  )}
              </Transaction>
            )}

            {!needsApproval && currentChainId === src.chainId && (
              <Transaction
                chainId={src.chainId}
                calls={[{
                  to: execTx.to,
                  data: execTx.data,
                  value: execTx.value,
                }]}
                onSuccess={(result: TransactionResponse) => {
                  console.info('[execute] success', result);
                  setShowSuccess(true);
                  setTimeout(() => setShowSuccess(false), 2000);
                }}
                onError={(error: TransactionError) => {
                  console.error('[execute] error', error);
                }}
              >
                <TransactionButton 
                  className="h-11 w-full rounded-lg bg-[var(--app-accent)] text-[var(--app-background)] text-sm font-medium hover:bg-[var(--app-accent-hover)] disabled:opacity-50"
                />
                {mounted &&
                  createPortal(
                    <div className="fixed left-1/2 -translate-x-1/2 bottom-[calc(env(safe-area-inset-bottom)+56px)] z-[60] w-[calc(100%-32px)] max-w-md px-2">
                      <TransactionToast className="w-full">
                        <TransactionToastIcon />
                        <TransactionToastLabel />
                        <TransactionToastAction />
                      </TransactionToast>
                    </div>,
                    document.body,
                  )}
              </Transaction>
            )}
          </div>
        )}

        {/* Legacy demo ETH send removed in favor of estimate+execute flow */}
      </div>
      {mounted && showSuccess &&
        createPortal(
          <div className="fixed left-1/2 -translate-x-1/2 bottom-[calc(env(safe-area-inset-bottom)+56px)] z-[70] w-[calc(100%-32px)] max-w-md px-2">
            <div className="w-full flex items-center gap-3 rounded-xl bg-gradient-to-r from-black/70 to-black/50 border border-white/15 backdrop-blur-md text-white px-4 py-3 shadow-[0_10px_25px_rgba(0,0,0,0.25)]">
              <div className="grid place-items-center rounded-full bg-white/10 w-7 h-7">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div className="text-sm font-medium">Trade completed</div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}


