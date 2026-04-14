"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { tldAbi, minterAbi } from "@/lib/contracts";
import { type DomainConfig, hasMinter } from "@/lib/domains";

export function useDomainPrice(domain: DomainConfig | undefined, nameLength: number) {
  const isMinted = domain ? hasMinter(domain) : false;
  const hasDiffPrices = domain ? domain.differentPrices > 1 : false;

  const { data: tldPrice, isLoading: tldPriceLoading } = useReadContract({
    address: domain?.address,
    abi: tldAbi,
    functionName: "price",
    chainId: domain?.chainId,
    query: { enabled: !!domain && !isMinted },
  });

  const { data: buyingEnabled, isLoading: buyingLoading } = useReadContract({
    address: domain?.address,
    abi: tldAbi,
    functionName: "buyingEnabled",
    chainId: domain?.chainId,
    query: { enabled: !!domain && !isMinted },
  });

  const { data: minterPaused, isLoading: pausedLoading } = useReadContract({
    address: (domain?.minter || undefined) as `0x${string}` | undefined,
    abi: minterAbi,
    functionName: "paused",
    chainId: domain?.chainId,
    query: { enabled: !!domain && isMinted },
  });

  const { data: minterSinglePrice, isLoading: minterPriceLoading } = useReadContract({
    address: (domain?.minter || undefined) as `0x${string}` | undefined,
    abi: minterAbi,
    functionName: "price",
    chainId: domain?.chainId,
    query: { enabled: !!domain && isMinted && !hasDiffPrices },
  });

  const priceFnNames = ["price1char", "price2char", "price3char", "price4char", "price5char", "price6char"] as const;
  const numPrices = domain?.differentPrices ?? 5;

  const { data: diffPricesData, isLoading: diffPricesLoading } = useReadContracts({
    contracts: priceFnNames.slice(0, numPrices).map((fn) => ({
      address: (domain?.minter || undefined) as `0x${string}`,
      abi: minterAbi,
      functionName: fn,
      chainId: domain?.chainId,
    })),
    query: { enabled: !!domain && isMinted && hasDiffPrices },
  });

  let price: bigint | undefined;
  let mintingDisabled = false;
  const isLoading = tldPriceLoading || buyingLoading || pausedLoading || minterPriceLoading || diffPricesLoading;

  if (!domain) {
    price = undefined;
  } else if (!isMinted) {
    mintingDisabled = buyingEnabled === false;
    price = tldPrice as bigint | undefined;
  } else {
    mintingDisabled = minterPaused === true;
    if (hasDiffPrices && diffPricesData) {
      const idx = Math.min(nameLength, numPrices) - 1;
      const effectiveIdx = nameLength >= numPrices ? numPrices - 1 : idx;
      const result = diffPricesData[effectiveIdx];
      price = result?.status === "success" ? (result.result as bigint) : undefined;
    } else {
      price = minterSinglePrice as bigint | undefined;
    }
  }

  return { price, mintingDisabled, isLoading };
}
