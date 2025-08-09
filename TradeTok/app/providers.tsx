"use client";

import { type ReactNode } from "react";
import { base, mainnet, optimism, arbitrum, zircuit } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { WagmiProvider, createConfig, http } from "wagmi";

const wagmiConfig = createConfig({
  chains: [base, optimism, arbitrum, mainnet],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC || "https://base-mainnet.g.alchemy.com/v2/kaFl069xyvy3np41aiUXwjULZrF67--t"),
    [optimism.id]: http(process.env.NEXT_PUBLIC_OPTIMISM_RPC || "https://opt-mainnet.g.alchemy.com/v2/kaFl069xyvy3np41aiUXwjULZrF67--t"),
    [arbitrum.id]: http(),
    [mainnet.id]: http(),
  },
});

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
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
        {props.children}
      </MiniKitProvider>
    </WagmiProvider>
  );
}
