"use client";

import { useState, useEffect } from "react";
import { useAccount, useSwitchChain, useBalance, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type DomainConfig, hasErc20Payment } from "@/lib/domains";
import { erc20Abi } from "@/lib/contracts";
import { useDomainHolder } from "@/hooks/useDomainLookup";
import { useDomainPrice } from "@/hooks/useDomainPrice";
import { useMintDomain } from "@/hooks/useMintDomain";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function MintPage({ domain }: { domain: DomainConfig }) {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const prefill = searchParams.get("name");
    if (prefill) {
      setName(prefill);
      setChecked(true);
    }
  }, [searchParams]);
  const cleanName = name.trim().toLowerCase();

  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const needsChainSwitch = chainId !== domain.chainId;

  const { isAvailable, isTaken, isLoading: holderLoading, refetch } = useDomainHolder(
    checked ? domain : undefined,
    cleanName
  );
  const { price, mintingDisabled, isLoading: priceLoading } = useDomainPrice(domain, cleanName.length);
  const { mint, reset, step, needsApproval, isLoading: mintLoading, isMintConfirmed, mintTxHash, mintError } = useMintDomain(
    domain,
    cleanName,
    price
  );

  const isErc20 = hasErc20Payment(domain);

  const { data: nativeBalance } = useBalance({
    address,
    chainId: domain.chainId,
    query: { enabled: !!address && !isErc20 },
  });

  const { data: erc20Balance } = useReadContract({
    address: domain.currencyAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: domain.chainId,
    query: { enabled: !!address && isErc20 },
  });

  const userBalance = isErc20 ? (erc20Balance as bigint | undefined) : nativeBalance?.value;
  const insufficientFunds = price !== undefined && userBalance !== undefined && userBalance < price;

  function handleCheck() {
    if (cleanName.length === 0) return;
    setChecked(true);
    refetch();
  }

  function handleMint() {
    if (needsChainSwitch) {
      switchChain({ chainId: domain.chainId });
      return;
    }
    mint();
  }

  function handleReset() {
    setName("");
    setChecked(false);
    reset();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-[var(--accent)]">{domain.tld}</span> domains
        </h1>
        <p className="text-[var(--muted)]">
          on {domain.chainName} &middot; Pay with {domain.currency}
        </p>
        {domain.website && (
          <a href={domain.website} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--accent)] hover:underline">
            {domain.website}
          </a>
        )}
      </div>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 space-y-6">
        {isMintConfirmed ? (
          <div className="text-center space-y-4">
            <div className="text-[var(--success)] text-5xl">&#10003;</div>
            <h2 className="text-xl font-bold">Domain minted!</h2>
            <p className="text-[var(--muted)]">
              <span className="font-semibold text-[var(--foreground)]">{cleanName}{domain.tld}</span> is now yours.
            </p>
            {mintTxHash && (
              <p className="text-xs text-[var(--muted)] break-all">TX: {mintTxHash}</p>
            )}
            <button onClick={handleReset} className="mt-4 px-6 py-2 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors">
              Mint another
            </button>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Domain name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value.replace(/[^a-zA-Z0-9]/g, ""));
                    setChecked(false);
                  }}
                  placeholder="yourname"
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
                <span className="flex items-center text-[var(--muted)] font-medium">{domain.tld}</span>
              </div>
            </div>

            {!checked ? (
              <button
                onClick={handleCheck}
                disabled={cleanName.length === 0}
                className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Check availability
              </button>
            ) : holderLoading || priceLoading ? (
              <div className="text-center py-4 text-[var(--muted)]">Checking...</div>
            ) : isTaken ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/20 text-center space-y-2">
                  <p className="text-[var(--error)] font-medium">{cleanName}{domain.tld} is taken</p>
                  <Link
                    href={`/domain/search?q=${encodeURIComponent(cleanName + domain.tld)}`}
                    className="text-sm text-[var(--accent)] hover:underline"
                  >
                    View domain details
                  </Link>
                </div>
                <button onClick={handleReset} className="w-full py-3 rounded-xl border border-[var(--card-border)] hover:bg-[var(--card)] transition-colors">
                  Try another name
                </button>
              </div>
            ) : isAvailable ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/20 text-center">
                  <p className="text-[var(--success)] font-medium">{cleanName}{domain.tld} is available!</p>
                </div>

                {mintingDisabled ? (
                  <div className="p-4 rounded-xl bg-[var(--warning)]/10 border border-[var(--warning)]/20 text-center">
                    <p className="text-[var(--warning)]">Minting is currently disabled for this domain.</p>
                  </div>
                ) : (
                  <>
                    {price !== undefined && (
                      <div className="flex justify-between items-center p-4 rounded-xl bg-[var(--background)] border border-[var(--card-border)]">
                        <span className="text-[var(--muted)]">Price</span>
                        <span className="font-bold">{formatUnits(price, domain.currencyDecimals)} {domain.currency}</span>
                      </div>
                    )}

                    {!address ? (
                      <div className="flex justify-center">
                        <ConnectButton />
                      </div>
                    ) : insufficientFunds && !needsChainSwitch ? (
                      <button
                        disabled
                        className="w-full py-3 rounded-xl bg-[var(--error)]/80 text-white font-medium opacity-70 cursor-not-allowed"
                      >
                        Insufficient {domain.currency} balance
                      </button>
                    ) : (
                      <>
                        {needsApproval && step === "idle" && (
                          <p className="text-xs text-[var(--muted)] text-center">
                            You will need to approve {domain.currency} spending first.
                          </p>
                        )}
                        <button
                          onClick={handleMint}
                          disabled={mintLoading}
                          className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
                        >
                          {mintLoading
                            ? step === "approving"
                              ? "Approving..."
                              : "Minting..."
                            : needsChainSwitch
                              ? `Switch to ${domain.chainName}`
                              : `Mint ${cleanName}${domain.tld}`}
                        </button>
                      </>
                    )}

                    {mintError && (
                      <p className="text-sm text-[var(--error)] text-center break-all">
                        {(mintError as Error).message?.slice(0, 200)}
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
