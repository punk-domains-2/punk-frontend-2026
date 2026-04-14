"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { resolverAbi, tldAbi } from "@/lib/contracts";
import { domains, resolvers, getDomainByTld, ZERO_ADDRESS, type DomainConfig } from "@/lib/domains";
import { getUserDomainsKey } from "@/lib/cache";

interface OwnedDomain {
  name: string;
  tld: string;
  fullName: string;
  chainId: number;
  tldAddress: `0x${string}`;
}

function useUserDomains(address: `0x${string}` | undefined) {
  const chainIds = Object.keys(resolvers).map(Number);

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

  const defaultDomains = useMemo(() => {
    if (!resolverResults) return [];
    const result: OwnedDomain[] = [];
    resolverResults.forEach((res, i) => {
      if (res.status !== "success" || !res.result) return;
      const domainsStr = res.result as string;
      if (!domainsStr.trim()) return;
      const names = domainsStr.split(/[\s,]+/).filter(Boolean);
      for (const fullName of names) {
        const lastDot = fullName.lastIndexOf(".");
        if (lastDot < 1) continue;
        const name = fullName.slice(0, lastDot);
        const tld = fullName.slice(lastDot);
        const domainConfig = getDomainByTld(tld);
        result.push({
          name,
          tld,
          fullName,
          chainId: chainIds[i],
          tldAddress: domainConfig?.address || ("0x0" as `0x${string}`),
        });
      }
    });
    return result;
  }, [resolverResults, chainIds]);

  return defaultDomains;
}

function EditDataModal({ domain, onClose }: { domain: OwnedDomain; onClose: () => void }) {
  const [dataStr, setDataStr] = useState("");
  const [loading, setLoading] = useState(true);

  const { data: currentData } = useReadContracts({
    contracts: [{
      address: domain.tldAddress,
      abi: tldAbi,
      functionName: "getDomainData",
      args: [domain.name],
      chainId: domain.chainId,
    }],
  });

  useEffect(() => {
    if (currentData?.[0]?.status === "success") {
      setDataStr(currentData[0].result as string || "{}");
      setLoading(false);
    } else if (currentData) {
      setLoading(false);
    }
  }, [currentData]);

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  function handleSave() {
    try {
      JSON.parse(dataStr);
    } catch {
      alert("Invalid JSON");
      return;
    }
    writeContract({
      address: domain.tldAddress,
      abi: tldAbi,
      functionName: "editData",
      args: [domain.name, dataStr],
      chainId: domain.chainId,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-auto space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold">Edit data for {domain.fullName}</h3>

        {isSuccess ? (
          <div className="text-center space-y-4">
            <p className="text-[var(--success)]">Domain data updated!</p>
            <button onClick={onClose} className="px-6 py-2 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors">
              Close
            </button>
          </div>
        ) : (
          <>
            {loading ? (
              <p className="text-[var(--muted)]">Loading current data...</p>
            ) : (
              <textarea
                value={dataStr}
                onChange={(e) => setDataStr(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)] focus:outline-none focus:border-[var(--accent)] font-mono text-sm resize-y"
              />
            )}
            <p className="text-xs text-[var(--muted)]">Must be valid JSON. Example: {`{"url":"https://example.com","image":"https://..."}`}</p>
            <div className="flex gap-2 justify-end">
              <button onClick={onClose} className="px-4 py-2 rounded-xl border border-[var(--card-border)] hover:bg-[var(--background)] transition-colors">Cancel</button>
              <button
                onClick={handleSave}
                disabled={isPending || loading}
                className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
              >
                {isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { address } = useAccount();
  const defaultDomains = useUserDomains(address);
  const [manualDomains, setManualDomains] = useState<OwnedDomain[]>([]);
  const [manualInput, setManualInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [editingDomain, setEditingDomain] = useState<OwnedDomain | null>(null);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);

  const { writeContract: setDefaultWrite, data: defaultTxHash, isPending: defaultPending } = useWriteContract();
  const { isSuccess: defaultSuccess } = useWaitForTransactionReceipt({ hash: defaultTxHash });

  useEffect(() => {
    if (defaultSuccess) setSettingDefault(null);
  }, [defaultSuccess]);

  useEffect(() => {
    if (!address) return;
    const key = getUserDomainsKey(address);
    try {
      const stored = localStorage.getItem(key);
      if (stored) setManualDomains(JSON.parse(stored));
    } catch { /* ignore */ }
  }, [address]);

  const saveManualDomains = useCallback((updated: OwnedDomain[]) => {
    setManualDomains(updated);
    if (address) {
      localStorage.setItem(getUserDomainsKey(address), JSON.stringify(updated));
    }
  }, [address]);

  const allDomains = useMemo(() => {
    const seen = new Set(defaultDomains.map((d) => d.fullName));
    return [...defaultDomains, ...manualDomains.filter((d) => !seen.has(d.fullName))];
  }, [defaultDomains, manualDomains]);

  async function handleAddManual() {
    const fullName = manualInput.trim().toLowerCase();
    if (!fullName.includes(".")) { setVerifyError("Enter a full domain name like name.flr"); return; }
    const lastDot = fullName.lastIndexOf(".");
    const name = fullName.slice(0, lastDot);
    const tld = fullName.slice(lastDot);
    const domainConfig = getDomainByTld(tld);
    if (!domainConfig) { setVerifyError(`Domain extension ${tld} not supported`); return; }

    setVerifying(true);
    setVerifyError("");
    try {
      const { createPublicClient, http } = await import("viem");
      const rpcData = (await import("../../../data/rpcs.json")).default as Record<string, string[]>;
      const rpcs = rpcData[String(domainConfig.chainId)];
      const client = createPublicClient({ transport: http(rpcs?.[0]) });
      const holder = await client.readContract({
        address: domainConfig.address,
        abi: tldAbi,
        functionName: "getDomainHolder",
        args: [name],
      });
      if (holder === ZERO_ADDRESS) { setVerifyError("Domain not registered"); setVerifying(false); return; }
      if (address && (holder as string).toLowerCase() !== address.toLowerCase()) {
        setVerifyError("You don't own this domain"); setVerifying(false); return;
      }
      const newDomain: OwnedDomain = { name, tld, fullName, chainId: domainConfig.chainId, tldAddress: domainConfig.address };
      if (!allDomains.find((d) => d.fullName === fullName)) {
        saveManualDomains([...manualDomains, newDomain]);
      }
      setManualInput("");
    } catch (err) {
      setVerifyError("Failed to verify domain ownership");
    }
    setVerifying(false);
  }

  function handleSetDefault(domain: OwnedDomain) {
    setSettingDefault(domain.fullName);
    setDefaultWrite({
      address: domain.tldAddress,
      abi: tldAbi,
      functionName: "editDefaultDomain",
      args: [domain.name],
      chainId: domain.chainId,
    });
  }

  if (!address) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-[var(--muted)]">Connect your wallet to manage your domains.</p>
        <div className="flex justify-center"><ConnectButton /></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-center">Your Domains</h1>

      {allDomains.length === 0 ? (
        <div className="text-center p-8 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl">
          <p className="text-[var(--muted)]">No domains found. Add one manually below.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allDomains.map((d) => (
            <div key={d.fullName} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[var(--card)] border border-[var(--card-border)] rounded-xl">
              <div>
                <p className="font-bold">{d.name}<span className="text-[var(--accent)]">{d.tld}</span></p>
                <p className="text-xs text-[var(--muted)]">Chain ID: {d.chainId}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setEditingDomain(d)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-[var(--card-border)] hover:bg-[var(--background)] transition-colors"
                >
                  Edit data
                </button>
                <button
                  onClick={() => handleSetDefault(d)}
                  disabled={defaultPending && settingDefault === d.fullName}
                  className="px-3 py-1.5 text-sm rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
                >
                  {defaultPending && settingDefault === d.fullName ? "Setting..." : "Set default"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 space-y-4">
        <h2 className="font-bold">Add domain manually</h2>
        <p className="text-sm text-[var(--muted)]">Enter a domain you own to add it to your dashboard.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => { setManualInput(e.target.value); setVerifyError(""); }}
            placeholder="e.g. tempe.flr"
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <button
            onClick={handleAddManual}
            disabled={verifying || !manualInput.trim()}
            className="px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
          >
            {verifying ? "Verifying..." : "Add"}
          </button>
        </div>
        {verifyError && <p className="text-sm text-[var(--error)]">{verifyError}</p>}
      </div>

      {editingDomain && <EditDataModal domain={editingDomain} onClose={() => setEditingDomain(null)} />}
    </div>
  );
}
