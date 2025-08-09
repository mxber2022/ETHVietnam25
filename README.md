# TradeTok — DeFi Social Trading Platform 

TradeTok is a mobile-first DeFi social trading app that blends TikTok-style video content with 1-click on-chain copy trading. Creators publish short videos for trade ideas; followers can copy trades with guardrails. The MVP includes a social feed, creator upload, basic on-chain strategy registry, copy-trade flow via an external engine, and a simple portfolio view.

## Feature Highlights

- TikTok-style vertical video feed with snap scrolling and auto play/pause
- Creator studio to publish strategies on-chain via `StrategyRegistry`
- Copy-trade flow with cross-chain USDC detection and execution (via Zircuit Trading Engine API)
- Guardrails: basic slippage/limits handled in payload and engine
- Portfolio summary with ETH and USDC balances across chains
- Glassy, mobile-first UI with bottom-centered navigation
- Farcaster MiniKit integration for Frames and notifications (unchanged logic per requirements)

## Tech Stack

- Frontend: Next.js (App Router), React, Tailwind CSS
- Wallet and Transactions: Coinbase OnchainKit MiniKit, Wagmi, Viem
- Chains: Base (primary), plus Mainnet, Optimism, Arbitrum for balances and sourcing USDC
- Contracts: Solidity (`StrategyRegistry.sol`, `CopyTrading.sol` prototype)
- External: Zircuit Trading Engine API (estimate/status proxy routes)
- Storage: Off-chain metadata by URI (e.g., IPFS/Arweave or direct video URL)
- Notifications: Upstash Redis + Farcaster `frame-sdk`

## Smart Contracts

- StrategyRegistry (deployed, Base):
  - Address: `0x8fd308C3F8596b5d4b563dc530DD84eBE69da656`
  - Purpose: Immutable strategy metadata storage (creator, title, URI, token, risk, entry range, stop-loss, timestamps, active)
  - Frontend ABI/address: `lib/contracts/strategyRegistry.ts`

- CopyTrading (prototype/not fully integrated):
  - Purpose: Record copy intents with guardrails (amount, slippage, leverage)
  - Frontend integration pending

## App Structure (key)

- `app/layout.tsx` — Root layout, mobile shell, global NavBar
- `app/(app)/feed/page.tsx` — TikTok-style snap feed; fetches `/api/strategies`
- `app/(app)/strategies/new/page.tsx` — Create Strategy form; publishes via OnchainKit `Transaction`
- `app/(app)/strategies/[id]/page.tsx` — Strategy details
- `app/(app)/strategies/[id]/copy/page.tsx` — Copy flow: USDC amount, estimate, approve, execute
- `app/(app)/portfolio/page.tsx` — Portfolio with ETH/USDC balances and recent activity
- `app/components/Video/*` — `VideoSlide` and `ActionBar` UI
- `app/api/strategies/route.ts` — Reads latest strategies from `StrategyRegistry` and enriches token/price
- `app/api/trade/estimate/route.ts` — Proxies to Zircuit Trading Engine `/order/estimate`
- `app/api/trade/status/route.ts` — Proxies to Zircuit Trading Engine `/order/status`
- `app/api/copy/route.ts` — Placeholder endpoint for server-side copy-trade orchestration

## Environment Variables

Required for MiniKit + Farcaster + Redis notifications. Example:

```bash
# OnchainKit / Project
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=
NEXT_PUBLIC_URL=
NEXT_PUBLIC_ICON_URL=
NEXT_PUBLIC_ONCHAINKIT_API_KEY=

# RPCs (optional overrides)
NEXT_PUBLIC_BASE_RPC=
NEXT_PUBLIC_OPTIMISM_RPC=

# Frame metadata (managed by create-onchain manifest)
FARCASTER_HEADER=
FARCASTER_PAYLOAD=
FARCASTER_SIGNATURE=
NEXT_PUBLIC_APP_ICON=
NEXT_PUBLIC_APP_SUBTITLE=
NEXT_PUBLIC_APP_DESCRIPTION=
NEXT_PUBLIC_APP_SPLASH_IMAGE=
NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR=
NEXT_PUBLIC_APP_PRIMARY_CATEGORY=
NEXT_PUBLIC_APP_HERO_IMAGE=
NEXT_PUBLIC_APP_TAGLINE=
NEXT_PUBLIC_APP_OG_TITLE=
NEXT_PUBLIC_APP_OG_DESCRIPTION=
NEXT_PUBLIC_APP_OG_IMAGE=

# Upstash Redis (for background notifications)
REDIS_URL=
REDIS_TOKEN=
```

## Token Addresses (USDC)

- Base: `0x833589fcd6edb6e08f4c7c32d4f71b54bda02913`
- Optimism: `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85`
- Arbitrum: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`
- Mainnet: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`

## Data Flow (MVP)

1. Creator publishes a strategy on-chain via `StrategyRegistry.createStrategy`.
2. Feed fetches recent strategies from contract using `/api/strategies`, adds token meta and price.
3. Copier enters USDC amount on Copy page.
4. App finds USDC across supported chains (Base/OP/Arb/Mainnet) and requests an estimate from Zircuit.
5. User approves (if needed) and executes the returned transaction with OnchainKit/Wagmi.
6. Portfolio shows ETH and USDC balances and a simple local activity log.

## Development

Install and run:

```bash
cd TradeTok
npm install
npm run dev
```

The dev server runs on `http://localhost:3000`.

## UI/UX Notes

- Mobile-first layout; glassy components and bottom-centered nav
- Snap scroller feed; auto play/pause; YouTube/MP4 with tap-to-unmute
- Transaction toasts rendered near bottom above nav for clarity

## Known Limitations / Roadmap

- CopyTrading.sol is not fully integrated into the frontend execution path
- Strategy `uri` currently points to direct video URL; off-chain JSON (IPFS/Arweave) recommended
- Portfolio stats beyond balances/activity are mocked; consider The Graph/Subgraph
- Copy flow currently focuses on USDC→ETH; can expand to other tokens
- Farcaster logic intentionally unchanged; any changes should preserve account association/notifications

## API Endpoints

- `GET /api/strategies` — List recent strategies from `StrategyRegistry`
- `POST /api/trade/estimate` — Proxy to Zircuit `/order/estimate`
- `GET /api/trade/status?txHash=…` — Proxy to Zircuit `/order/status`
- `POST /api/copy` — Placeholder for copy-trade orchestration

## Security & Resiliency

- Minimal on-chain writes; robust error handling on API routes
- RPC rate-limit awareness (batch listing over per-item reads)
- Balance checks across chains; stable transaction call arrays

## License

MIT
