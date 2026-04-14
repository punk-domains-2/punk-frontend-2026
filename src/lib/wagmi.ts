import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  braveWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import {
  mainnet,
  arbitrum,
  optimism,
  polygon,
  gnosis,
  zkSync,
  base,
  scroll,
  linea,
  blast,
  bsc,
  fantom,
} from "wagmi/chains";
import { http, fallback } from "wagmi";
import { flare, songbird, degenChain, superposition, taiko, rpcs } from "./chains";

function transportsForChain(chainId: number) {
  const urls = rpcs[String(chainId)];
  if (!urls || urls.length === 0) return http();
  if (urls.length === 1) return http(urls[0]);
  return fallback(urls.map((url) => http(url)));
}

const allChains = [
  mainnet,
  arbitrum,
  optimism,
  polygon,
  gnosis,
  zkSync,
  base,
  scroll,
  linea,
  blast,
  bsc,
  fantom,
  flare,
  songbird,
  degenChain,
  superposition,
  taiko,
] as const;

export const config = getDefaultConfig({
  appName: "Punk Domains",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "your_walletconnect_project_id_here",
  chains: allChains,
  transports: Object.fromEntries(
    allChains.map((chain) => [chain.id, transportsForChain(chain.id)])
  ),
  ssr: false,
  wallets: [
    {
      groupName: "Popular",
      wallets: [
        braveWallet,
        injectedWallet,
        metaMaskWallet,
        rainbowWallet,
        walletConnectWallet
      ],
    },
  ],
});

export { allChains };
