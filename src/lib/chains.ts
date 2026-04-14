import { type Chain } from "viem";
import rpcsData from "../../data/rpcs.json";

const rpcs = rpcsData as Record<string, string[]>;

export const flare: Chain = {
  id: 14,
  name: "Flare",
  nativeCurrency: { name: "Flare", symbol: "FLR", decimals: 18 },
  rpcUrls: { default: { http: rpcs["14"] } },
  blockExplorers: { default: { name: "Flare Explorer", url: "https://flare-explorer.flare.network" } },
};

export const songbird: Chain = {
  id: 19,
  name: "Songbird",
  nativeCurrency: { name: "Songbird", symbol: "SGB", decimals: 18 },
  rpcUrls: { default: { http: rpcs["19"] } },
  blockExplorers: { default: { name: "Songbird Explorer", url: "https://songbird-explorer.flare.network" } },
};

export const degenChain: Chain = {
  id: 666666666,
  name: "Degen Chain",
  nativeCurrency: { name: "DEGEN", symbol: "DEGEN", decimals: 18 },
  rpcUrls: { default: { http: rpcs["666666666"] } },
  blockExplorers: { default: { name: "Degen Explorer", url: "https://explorer.degen.tips" } },
};

export const superposition: Chain = {
  id: 55244,
  name: "Superposition",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: rpcs["55244"] } },
  blockExplorers: { default: { name: "Superposition Explorer", url: "https://explorer.superposition.so" } },
};

export const taiko: Chain = {
  id: 167000,
  name: "Taiko",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: rpcs["167000"] } },
  blockExplorers: { default: { name: "Taiko Explorer", url: "https://taikoscan.io" } },
};

export { rpcs };
