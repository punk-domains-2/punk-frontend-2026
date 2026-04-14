"use client";

import { useState, useMemo, useEffect } from "react";
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { resolverAbi } from "@/lib/contracts";
import { resolvers } from "@/lib/domains";
import { getPreferredDomainKey, cacheSet, cacheGet } from "@/lib/cache";
import { allChains } from "@/lib/wagmi";

function getChainName(chainId: number): string {
  const chain = allChains.find((c) => c.id === chainId);
  return chain?.name || `Chain ${chainId}`;
}

export default function SettingsPage() {
  const { address } = useAccount();
  const chainIds = useMemo(() => Object.keys(resolvers).map(Number), []);

  const { data: resolverResults } = useReadContracts({
    contracts: chainIds.map((chainId) => ({
      address: resolvers[String(chainId)] as `0x${string}`,
      abi: resolverAbi,
      functionName: "getDefaultDomains" as const,
      args: address ? [address] : undefined,
      chainId,
    })),
    query: { enabled: !!address },
  });

  const chainDomains = useMemo(() => {
    if (!resolverResults) return [];
    return chainIds.map((chainId, i) => {
      const res = resolverResults[i];
      const domainsStr = res?.status === "success" ? (res.result as string) : "";
      const names = domainsStr ? domainsStr.split(/[\s,]+/).filter(Boolean) : [];
      return { chainId, chainName: getChainName(chainId), names };
    }).filter((c) => c.names.length > 0);
  }, [resolverResults, chainIds]);

  const [preferences, setPreferences] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    if (!address) return;
    const prefs: Record<number, string> = {};
    chainIds.forEach((chainId) => {
      const cached = cacheGet<string>(getPreferredDomainKey(address, chainId));
      if (cached) prefs[chainId] = cached;
    });
    setPreferences(prefs);
  }, [address, chainIds]);

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess && saving !== null && address) {
      const pref = preferences[saving];
      if (pref) cacheSet(getPreferredDomainKey(address, saving), pref, 365 * 24 * 60 * 60 * 1000);
      setSaving(null);
    }
  }, [isSuccess, saving, preferences, address]);

  function handleSelect(chainId: number, fullName: string) {
    setPreferences((prev) => ({ ...prev, [chainId]: fullName }));
  }

  function handleSave(chainId: number) {
    const fullName = preferences[chainId];
    if (!fullName || !address) return;
    const lastDot = fullName.lastIndexOf(".");
    const name = fullName.slice(0, lastDot);
    const tld = fullName.slice(lastDot + 1);

    setSaving(chainId);
    writeContract({
      address: resolvers[String(chainId)] as `0x${string}`,
      abi: resolverAbi,
      functionName: "setCustomDefaultDomain",
      args: [name, tld],
      chainId,
    });
  }

  if (!address) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[var(--muted)]">Connect your wallet to manage your display preferences.</p>
        <div className="flex justify-center"><ConnectButton /></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-[var(--muted)]">Choose which domain name to display in the navbar for each chain.</p>
      </div>

      {chainDomains.length === 0 ? (
        <div className="text-center p-8 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl">
          <p className="text-[var(--muted)]">No domains found on any chain.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chainDomains.map((chain) => (
            <div key={chain.chainId} className="p-4 bg-[var(--card)] border border-[var(--card-border)] rounded-xl space-y-3">
              <h3 className="font-medium">{chain.chainName}</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={preferences[chain.chainId] || ""}
                  onChange={(e) => handleSelect(chain.chainId, e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] focus:outline-none cursor-pointer"
                >
                  <option value="">Select a domain</option>
                  {chain.names.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleSave(chain.chainId)}
                  disabled={(isPending && saving === chain.chainId) || !preferences[chain.chainId]}
                  className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
                >
                  {isPending && saving === chain.chainId ? "Saving..." : "Save on-chain"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
