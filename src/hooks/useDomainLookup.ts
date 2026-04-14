"use client";

import { useReadContract } from "wagmi";
import { tldAbi } from "@/lib/contracts";
import { ZERO_ADDRESS, type DomainConfig } from "@/lib/domains";

export function useDomainHolder(domain: DomainConfig | undefined, name: string) {
  const { data: holder, isLoading, refetch } = useReadContract({
    address: domain?.address,
    abi: tldAbi,
    functionName: "getDomainHolder",
    args: [name],
    chainId: domain?.chainId,
    query: { enabled: !!domain && name.length > 0 },
  });

  const isAvailable = holder === ZERO_ADDRESS;
  const isTaken = !!holder && holder !== ZERO_ADDRESS;

  return { holder, isAvailable, isTaken, isLoading, refetch };
}

export function useDomainData(domain: DomainConfig | undefined, name: string) {
  return useReadContract({
    address: domain?.address,
    abi: tldAbi,
    functionName: "getDomainData",
    args: [name],
    chainId: domain?.chainId,
    query: { enabled: !!domain && name.length > 0 },
  });
}

export function useDomainTokenId(domain: DomainConfig | undefined, name: string) {
  return useReadContract({
    address: domain?.address,
    abi: tldAbi,
    functionName: "domains",
    args: [name],
    chainId: domain?.chainId,
    query: { enabled: !!domain && name.length > 0 },
  });
}

export function useTokenURI(domain: DomainConfig | undefined, tokenId: bigint | undefined) {
  return useReadContract({
    address: domain?.address,
    abi: tldAbi,
    functionName: "tokenURI",
    args: tokenId !== undefined ? [tokenId] : undefined,
    chainId: domain?.chainId,
    query: { enabled: !!domain && tokenId !== undefined && tokenId > 0n },
  });
}
