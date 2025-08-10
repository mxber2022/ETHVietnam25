"use client";

import { type ReactNode } from "react";
import { base, mainnet, optimism, arbitrum, zircuit } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { mainnet as reownMainnet, arbitrum as reownArbitrum } from "@reown/appkit/networks";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { WagmiProvider, createConfig, http } from "wagmi";
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector";

// ✅ Query Client
const queryClient = new QueryClient();

// ✅ Env vars with defaults
const projectId = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID || "59198889d7df78b39ea70d871d0ec131";
const metadata = {
  name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "TradeTok",
  description: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_DESCRIPTION || "DeFi Social Trading",
  url: process.env.NEXT_PUBLIC_URL || "https://example.com",
  icons: [process.env.NEXT_PUBLIC_ICON_URL || "https://avatars.githubusercontent.com/u/179229932"]
};

// ✅ AppKit networks (required for AppKit)
const appkitNetworks = [zircuit];

// ✅ Ethers5 Adapter for WalletConnect
const ethersAdapter = new Ethers5Adapter();

// ✅ Init Reown AppKit with Ethers5Adapter
createAppKit({
  adapters: [ethersAdapter],
  networks: appkitNetworks as any,
  projectId,
  metadata,
  features: { analytics: true }
});

// ✅ RPC helper
const rpc = (env: string | undefined, fallback: string) => http(env || fallback);

// ✅ Build Wagmi config with Farcaster connector
const wagmiConfigCombined = (() => {
  const transports = {
    [base.id]: rpc(process.env.NEXT_PUBLIC_BASE_RPC, "https://base-mainnet.g.alchemy.com/v2/demo"),
    [optimism.id]: rpc(process.env.NEXT_PUBLIC_OPTIMISM_RPC, "https://opt-mainnet.g.alchemy.com/v2/demo"),
    [arbitrum.id]: rpc(process.env.NEXT_PUBLIC_ARBITRUM_RPC, "https://arb1.arbitrum.io/rpc"),
    [mainnet.id]: rpc(process.env.NEXT_PUBLIC_MAINNET_RPC, "https://eth.llamarpc.com"),
    [zircuit.id]: rpc(process.env.NEXT_PUBLIC_ZIRCUIT_RPC, "https://mainnet.zircuit.com"),
  } as const;

  // ✅ Get connectors from Ethers5 adapter
  const ethersConnectors = (ethersAdapter as any).wagmiConfig?.connectors || [];
  const resolvedConnectors = typeof ethersConnectors === "function" ? ethersConnectors() : ethersConnectors;
  
  // ✅ Add Farcaster connector
  const connectors = [...resolvedConnectors, farcasterFrame()];

  return createConfig({
    chains: [base, mainnet, optimism, arbitrum, zircuit],
    transports,
    connectors,
  });
})();

// ✅ Providers Component
export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfigCombined}>
      <QueryClientProvider client={queryClient}>
        <MiniKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          config={{
            appearance: {
              mode: "auto",
              theme: "mini-app-theme",
              name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
              logo: process.env.NEXT_PUBLIC_ICON_URL,
            },
          }}
        >
          {children}
        </MiniKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
