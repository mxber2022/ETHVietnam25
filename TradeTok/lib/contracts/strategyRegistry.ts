export const STRATEGY_REGISTRY_ADDRESS = (
  process.env.NEXT_PUBLIC_STRATEGY_REGISTRY_ADDRESS ||
  "0x8fd308C3F8596b5d4b563dc530DD84eBE69da656"
) as `0x${string}`;

// Minimal ABI used by the app (create + reads)
export const STRATEGY_REGISTRY_ABI = [
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "createStrategy",
    inputs: [
      { name: "title", type: "string" },
      { name: "uri", type: "string" },
      { name: "token", type: "address" },
      { name: "risk", type: "uint8" },
      { name: "entryMinUsd", type: "uint128" },
      { name: "entryMaxUsd", type: "uint128" },
      { name: "stopLossBps", type: "uint16" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "getStrategy",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "creator", type: "address" },
          { name: "title", type: "string" },
          { name: "uri", type: "string" },
          { name: "token", type: "address" },
          { name: "risk", type: "uint8" },
          { name: "entryMinUsd", type: "uint128" },
          { name: "entryMaxUsd", type: "uint128" },
          { name: "stopLossBps", type: "uint16" },
          { name: "createdAt", type: "uint64" },
          { name: "active", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "totalStrategies",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "listStrategies",
    inputs: [
      { name: "offset", type: "uint256" },
      { name: "limit", type: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "creator", type: "address" },
          { name: "title", type: "string" },
          { name: "uri", type: "string" },
          { name: "token", type: "address" },
          { name: "risk", type: "uint8" },
          { name: "entryMinUsd", type: "uint128" },
          { name: "entryMaxUsd", type: "uint128" },
          { name: "stopLossBps", type: "uint16" },
          { name: "createdAt", type: "uint64" },
          { name: "active", type: "bool" },
        ],
      },
    ],
  },
] as const;



