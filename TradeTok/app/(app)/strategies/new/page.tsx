"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Transaction,
  TransactionButton,
  TransactionToast,
  TransactionToastAction,
  TransactionToastIcon,
  TransactionToastLabel,
  type TransactionError,
  type TransactionResponse,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";
import ConnectButton from "@/app/components/ConnectButton";
import { useAccount, useWalletClient } from "wagmi";
import { encodeFunctionData, createPublicClient, http } from "viem";
import { zircuit } from "viem/chains";
import { STRATEGY_REGISTRY_ADDRESS, STRATEGY_REGISTRY_ABI } from "@/lib/contracts/strategyRegistry";
import { ethers } from "ethers";
import { useAppKitProvider } from "@reown/appkit/react";
import { providers, Contract } from "ethers";

const TOKENS = [
  { symbol: "ETH", label: "Ethereum (ETH)" },
  { symbol: "BTC", label: "Bitcoin (BTC)" },
  { symbol: "SOL", label: "Solana (SOL)" },
];

type Risk = "Low" | "Medium" | "High";

export default function NewStrategyPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [token, setToken] = useState("ETH");
  const [risk, setRisk] = useState<Risk>("Medium");
  const [stopLoss, setStopLoss] = useState(1.5);
  const [entryMin, setEntryMin] = useState<number | "">("");
  const [entryMax, setEntryMax] = useState<number | "">("");
  const [usePerps, setUsePerps] = useState(false);
  const [leverage, setLeverage] = useState(2);
  // tags removed for minimal form
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [publishingZircuit, setPublishingZircuit] = useState(false);
  const { walletProvider } = useAppKitProvider('eip155');
  
  const entryRangeValid = useMemo(() => {
    if (entryMin === "" || entryMax === "") return false;
    const min = Number(entryMin);
    const max = Number(entryMax);
    return min > 0 && max > 0 && min <= max;
  }, [entryMin, entryMax]);

  const canPublish = useMemo(
    () => title.trim().length > 2 && videoUrl.trim().length > 5 && entryRangeValid,
    [title, videoUrl, entryRangeValid],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // submission handled by TransactionButton
  };

  const riskToUint = (r: Risk): number => (r === "Low" ? 0 : r === "Medium" ? 1 : 2);

  const scaleUsd6 = (n: number) => BigInt(Math.round(n * 1_000_000));

  const strategyUri = useMemo(() => {
    // Minimal: use videoUrl as URI placeholder. In production, store JSON on IPFS/Arweave and reference here.
    return videoUrl;
  }, [videoUrl]);

  const tokenAddress: `0x${string}` = "0x0000000000000000000000000000000000000000"; // TODO: map symbol -> address

  const calls = useMemo(() => {
    if (!canPublish) return [] as { to: `0x${string}`; data: `0x${string}`; value?: bigint }[];
    try {
      const data = encodeFunctionData({
        abi: STRATEGY_REGISTRY_ABI as any,
        functionName: "createStrategy",
        args: [
          title,
          strategyUri,
          tokenAddress,
          riskToUint(risk),
          scaleUsd6(Number(entryMin)),
          scaleUsd6(Number(entryMax)),
          Math.round(stopLoss * 100),
        ],
      });
      return [
        {
          to: STRATEGY_REGISTRY_ADDRESS,
          data: data as `0x${string}`,
        },
      ];
    } catch (_e) {
      return [];
    }
  }, [canPublish, entryMax, entryMin, risk, stopLoss, strategyUri, title, tokenAddress]);



  // async function publishOnZircuit() {
  //   if (!address || !canPublish) return;
  //   try {
  //     setPublishingZircuit(true);
      
  //     // Use AppKit's ethers adapter for WalletConnect
  //     const appkit = (window as any).appkit;
  //     if (!appkit) {
  //       console.error("AppKit not available");
  //       setPublishingZircuit(false);
  //       return;
  //     }

  //     // Get the ethers provider and signer from AppKit
  //     const provider = appkit.provider;
  //     const signer = appkit.signer;
      
  //     if (!provider || !signer) {
  //       console.error("AppKit provider or signer not available");
  //       setPublishingZircuit(false);
  //       return;
  //     }

  //     // Create contract instance with ethers
  //     const contract = new ethers.Contract(STRATEGY_REGISTRY_ADDRESS, STRATEGY_REGISTRY_ABI, signer);
      
  //     // Prepare transaction data
  //     const txData = contract.interface.encodeFunctionData("createStrategy", [
  //       title,
  //       strategyUri,
  //       tokenAddress,
  //       riskToUint(risk),
  //       scaleUsd6(Number(entryMin)),
  //       scaleUsd6(Number(entryMax)),
  //       Math.round(stopLoss * 100),
  //     ]);

  //     // Send transaction through WalletConnect
  //     const tx = await signer.sendTransaction({
  //       to: STRATEGY_REGISTRY_ADDRESS,
  //       data: txData,
  //       value: ethers.utils.parseEther("0"),
  //     });
      
  //     console.info("[zircuit] txHash", tx.hash);
  //     // simple redirect; toast is handled by OnchainKit path otherwise
  //     router.push("/feed");
  //   } catch (e) {
  //     console.error("[zircuit] publish error", e);
  //     setPublishingZircuit(false);
  //   }
  // }

async function publishOnZircuit() {
  if (!address || !canPublish || !walletProvider) return;

  try {
    setPublishingZircuit(true);

    // Use the AppKit wallet provider for WalletConnect
    const ethersProvider = new providers.Web3Provider(walletProvider);
    const signer = ethersProvider.getSigner();

    // 🔹 Create contract instance
    const contract = new Contract(
      STRATEGY_REGISTRY_ADDRESS,
      STRATEGY_REGISTRY_ABI,
      signer
    );

    // 🔹 Send transaction
    const tx = await contract.createStrategy(
      title,
      strategyUri,
      tokenAddress,
      riskToUint(risk),
      scaleUsd6(Number(entryMin)),
      scaleUsd6(Number(entryMax)),
      Math.round(stopLoss * 100)
    );

    console.info("[zircuit] txHash", tx.hash);
    await tx.wait();

    router.push("/feed");
  } catch (e) {
    console.error("[zircuit] publish error", e);
    setPublishingZircuit(false);
  }
}


  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Create Strategy</div>
        <ConnectButton />
      </div>
      <form onSubmit={submit} className="space-y-3 glass rounded-xl p-3">
        <div className="space-y-2">
          <label className="block text-sm text-[var(--app-foreground-muted)]">Video</label>
          <div className="flex items-center gap-2">
            <input
              value={videoUrl}
              onChange={(e) => {
                setVideoError(null);
                setVideoUrl(e.target.value);
              }}
              placeholder="Paste a link to your video"
              className="flex-1 px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-md"
              required
            />
            <label
              htmlFor="video-file"
              className="cursor-pointer rounded-full w-10 h-10 grid place-items-center border border-[var(--app-card-border)] bg-[var(--app-card-bg)] hover:bg-[var(--app-accent-light)]"
              aria-label="Upload video"
              title="Upload video"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
                <path d="M16 6l-4-4-4 4" />
                <path d="M12 2v14" />
              </svg>
            </label>
            <input
              id="video-file"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                setVideoError(null);
                const file = e.target.files?.[0];
                if (!file) return;
                const maxMB = 100;
                const sizeMB = file.size / (1024 * 1024);
                if (sizeMB > maxMB) {
                  setVideoError(`File too large: ${sizeMB.toFixed(1)}MB (max ${maxMB}MB)`);
                  return;
                }
                const url = URL.createObjectURL(file);
                setLocalBlobUrl(url);
                setVideoUrl(url);
              }}
            />
            {/* Paste link icon removed by request; users can manually paste into the input */}
          </div>
          {videoUrl && (
            <div className="flex justify-end">
              <button
                type="button"
                className="px-3 py-2 rounded-md text-sm border border-[var(--app-card-border)] hover:bg-[var(--app-accent-light)]"
                onClick={() => {
                  setVideoUrl("");
                  setVideoError(null);
                  setLocalBlobUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return null;
                  });
                }}
              >
                Clear
              </button>
            </div>
          )}
          {videoError && <p className="text-[10px] text-red-500">{videoError}</p>}
          <p className="text-[10px] text-[var(--app-foreground-muted)]">Upload a video file or paste a direct MP4 link.</p>
        </div>

        <div>
          <label className="block text-sm mb-1 text-[var(--app-foreground-muted)]">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-md" required />
        </div>

        <div>
          <label className="block text-sm mb-1 text-[var(--app-foreground-muted)]">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-md" placeholder="What’s the setup, time frame, and rationale?" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1 text-[var(--app-foreground-muted)]">Token</label>
            <select value={token} onChange={(e) => setToken(e.target.value)} className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-md">
              {TOKENS.map((t) => (
                <option key={t.symbol} value={t.symbol}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 text-[var(--app-foreground-muted)]">Risk</label>
            <select
              value={risk}
              onChange={(e) => setRisk(e.target.value as Risk)}
              className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-md"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1 text-[var(--app-foreground-muted)]">Buy between (USD)</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="Min"
              value={entryMin}
              onChange={(e) => setEntryMin(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-md"
              required
            />
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="Max"
              value={entryMax}
              onChange={(e) => setEntryMax(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-md"
              required
            />
          </div>
          {!entryRangeValid && (
            <p className="mt-1 text-[10px] text-red-500">Enter a valid range with Min ≤ Max and both greater than 0.</p>
          )}
        </div>

        {/* Position size removed per product decision */}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1 text-[var(--app-foreground-muted)]">Stop loss %</label>
            <input type="number" step="0.1" value={stopLoss} onChange={(e) => setStopLoss(parseFloat(e.target.value))} className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-md" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-[var(--app-foreground-muted)]">Perps</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setUsePerps((v) => !v)} className={`px-3 py-2 rounded-md text-sm border ${usePerps ? "bg-[var(--app-accent-light)] border-[var(--app-accent)]" : "border-[var(--app-card-border)]"}`}>{usePerps ? "Enabled" : "Disabled"}</button>
              {usePerps && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--app-foreground-muted)]">Lev</span>
                  <input type="number" min={1} max={50} value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value) || 1)} className="w-24 px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-md" />
                  <span className="text-xs text-[var(--app-foreground-muted)]">x</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tags removed per product decision */}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => router.push("/feed")}
            className="h-11 border border-[var(--app-card-border)] rounded-lg text-sm font-medium hover:bg-[var(--app-accent-light)]"
          >
            Cancel
          </button>
          <Transaction
            calls={calls}
            chainId={8453} // Base chain ID for Farcaster
            onSuccess={(r: TransactionResponse) => router.push("/feed")}
            onError={(e: TransactionError) => console.error(e)}
          >
            <TransactionButton
              className="h-11 w-full rounded-lg bg-[var(--app-accent)] text-[var(--app-background)] text-sm font-medium hover:bg-[var(--app-accent-hover)] disabled:opacity-50"
              disabled={!canPublish}
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
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={publishOnZircuit}
            disabled={!canPublish || !walletProvider || publishingZircuit}
            className="h-11 w-full rounded-lg border border-[var(--app-card-border)] text-sm font-medium hover:bg-[var(--app-accent-light)] disabled:opacity-50"
          >
            {publishingZircuit ? "Publishing on Zircuit…" : "Publish on Zircuit (WalletConnect)"}
          </button>
          <p className="text-[10px] text-[var(--app-foreground-muted)]">Uses your WalletConnect session to add/switch to Zircuit and publish directly.</p>
        </div>

        {/* Preview removed per product decision */}
      </form>
    </div>
  );
}


