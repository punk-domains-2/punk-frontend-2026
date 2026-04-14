"use client";

import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from "wagmi";
import { tldAbi, minterAbi, erc20Abi } from "@/lib/contracts";
import { type DomainConfig, hasMinter, hasErc20Payment, REFERRER_ADDRESS } from "@/lib/domains";
import { useState, useEffect, useCallback } from "react";

export function useMintDomain(domain: DomainConfig | undefined, name: string, price: bigint | undefined) {
  const { address } = useAccount();
  const isMinted = domain ? hasMinter(domain) : false;
  const isErc20 = domain ? hasErc20Payment(domain) : false;

  const { data: allowance } = useReadContract({
    address: domain?.currencyAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && domain?.minter ? [address, domain.minter as `0x${string}`] : undefined,
    chainId: domain?.chainId,
    query: { enabled: isErc20 && !!address && !!domain?.minter },
  });

  const needsApproval = isErc20 && price !== undefined && (allowance === undefined || (allowance as bigint) < price);

  const { writeContract: approveToken, data: approveTxHash, isPending: isApproving, reset: resetApprove } = useWriteContract();
  const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveTxHash });

  const { writeContract: mintWrite, data: mintTxHash, isPending: isMintPending, reset: resetMint, error: mintError } = useWriteContract();
  const { isLoading: isMintConfirming, isSuccess: isMintConfirmed } = useWaitForTransactionReceipt({ hash: mintTxHash });

  const [step, setStep] = useState<"idle" | "approving" | "minting" | "confirmed">("idle");

  useEffect(() => {
    if (approveConfirmed && step === "approving") {
      setStep("minting");
      executeMint();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveConfirmed]);

  useEffect(() => {
    if (isMintConfirmed) setStep("confirmed");
  }, [isMintConfirmed]);

  const executeMint = useCallback(() => {
    if (!domain || !address || !name || price === undefined) return;

    if (isMinted) {
      mintWrite({
        address: domain.minter as `0x${string}`,
        abi: minterAbi,
        functionName: "mint",
        args: [name, address, REFERRER_ADDRESS],
        value: isErc20 ? 0n : price,
        chainId: domain.chainId,
      });
    } else {
      mintWrite({
        address: domain.address,
        abi: tldAbi,
        functionName: "mint",
        args: [name, address, REFERRER_ADDRESS],
        value: price,
        chainId: domain.chainId,
      });
    }
  }, [domain, address, name, price, isMinted, isErc20, mintWrite]);

  function mint() {
    if (!domain || !address || !name || price === undefined) return;

    if (needsApproval) {
      setStep("approving");
      approveToken({
        address: domain.currencyAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [domain.minter as `0x${string}`, price],
        chainId: domain.chainId,
      });
    } else {
      setStep("minting");
      executeMint();
    }
  }

  function reset() {
    setStep("idle");
    resetApprove();
    resetMint();
  }

  return {
    mint,
    reset,
    step,
    needsApproval,
    isApproving,
    isMintPending,
    isMintConfirming,
    isMintConfirmed,
    mintTxHash,
    mintError,
    isLoading: isApproving || isMintPending || isMintConfirming,
  };
}
