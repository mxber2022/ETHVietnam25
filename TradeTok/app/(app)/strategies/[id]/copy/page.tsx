"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
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
  const [quantityEth, setQuantityEth] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isValidQty = useMemo(() => {
    const n = Number(quantityEth);
    return Number.isFinite(n) && n > 0;
  }, [quantityEth]);

  const calls = useMemo(() => {
    if (!address || !isValidQty) return [] as { to: `0x${string}`; data: `0x${string}`; value?: bigint }[];
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
  }, [address, isValidQty, quantityEth]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Copy Strategy</h2>
        <Link href="/feed" className="text-sm text-[var(--app-foreground-muted)]">Back</Link>
      </div>
      <div className="space-y-3 glass rounded-xl p-3">
        <div>
          <label className="block text-sm mb-1 text-[var(--app-foreground-muted)]">Quantity (ETH)</label>
          <input
            inputMode="decimal"
            placeholder="e.g. 0.05"
            value={quantityEth}
            onChange={(e) => setQuantityEth(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-md"
          />
          <p className="mt-1 text-[10px] text-[var(--app-foreground-muted)]">Demo: sends the entered ETH amount as a transaction from your wallet.</p>
        </div>

        <Transaction
          calls={calls}
          onSuccess={(_r: TransactionResponse) => {
            try {
              const prev = JSON.parse(localStorage.getItem("copyActivity") || "[]");
              prev.push({ id: params?.id, qtyEth: quantityEth, ts: Date.now() });
              localStorage.setItem("copyActivity", JSON.stringify(prev));
            } catch {}
            router.push("/portfolio");
          }}
          onError={(_e: TransactionError) => {}}
        >
          <TransactionButton
            className="h-11 w-full rounded-lg bg-[var(--app-accent)] text-[var(--app-background)] text-sm font-medium hover:bg-[var(--app-accent-hover)] disabled:opacity-50"
            disabled={!isValidQty}
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
    </div>
  );
}


