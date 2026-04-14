"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatEther } from "viem";
import { getDomainByTld, ZERO_ADDRESS, type DomainConfig } from "@/lib/domains";
import { useDomainHolder, useDomainData, useDomainTokenId, useTokenURI } from "@/hooks/useDomainLookup";

function DomainImage({ domain, tokenId }: { domain: DomainConfig; tokenId: bigint | undefined }) {
  const { data: tokenUriRaw } = useTokenURI(domain, tokenId);
  const [svgSrc, setSvgSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenUriRaw || typeof tokenUriRaw !== "string") return;
    try {
      let json: string;
      if (tokenUriRaw.startsWith("data:application/json;base64,")) {
        json = atob(tokenUriRaw.replace("data:application/json;base64,", ""));
      } else if (tokenUriRaw.startsWith("{")) {
        json = tokenUriRaw;
      } else {
        return;
      }
      const metadata = JSON.parse(json);
      if (metadata.image) {
        setSvgSrc(metadata.image);
      }
    } catch {
      // Ignore parse errors
    }
  }, [tokenUriRaw]);

  if (!svgSrc) return null;
  return (
    <div className="rounded-xl overflow-hidden border border-[var(--card-border)] bg-[var(--background)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={svgSrc} alt="Domain NFT" className="w-full max-w-[300px] mx-auto" />
    </div>
  );
}

function DomainDataDisplay({ dataStr }: { dataStr: string | undefined }) {
  const parsed = useMemo(() => {
    if (!dataStr) return null;
    try { return JSON.parse(dataStr); } catch { return null; }
  }, [dataStr]);

  if (!parsed || typeof parsed !== "object") return null;

  return (
    <div className="space-y-2">
      <h3 className="font-medium">Domain Data</h3>
      <div className="space-y-1">
        {Object.entries(parsed).map(([key, value]) => (
          <div key={key} className="flex flex-col sm:flex-row gap-1 p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
            <span className="text-[var(--muted)] text-sm font-medium min-w-[80px]">{key}</span>
            <span className="text-sm break-all">
              {typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://")) ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">{value}</a>
              ) : (
                String(value)
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState(searchParams.get("q") || "");
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const { domainName, tld, domain } = useMemo(() => {
    const lastDot = query.lastIndexOf(".");
    if (lastDot < 1) return { domainName: "", tld: "", domain: undefined };
    const name = query.slice(0, lastDot).toLowerCase();
    const ext = query.slice(lastDot);
    return { domainName: name, tld: ext, domain: getDomainByTld(ext) };
  }, [query]);

  const { holder, isAvailable, isTaken, isLoading: holderLoading } = useDomainHolder(domain, domainName);
  const { data: domainData } = useDomainData(domain, domainName);
  const { data: domainInfo } = useDomainTokenId(domain, domainName);
  const tokenId = domainInfo ? (domainInfo as [string, bigint, string, string])[1] : undefined;

  const customImage = useMemo(() => {
    if (!domainData || typeof domainData !== "string") return null;
    try {
      const parsed = JSON.parse(domainData);
      return parsed.image || null;
    } catch { return null; }
  }, [domainData]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(input.trim().toLowerCase());
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Search domains</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. tempe.flr"
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--card-border)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {query && !domain && (
        <div className="text-center p-6 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl">
          <p className="text-[var(--muted)]">
            Domain extension <strong>{tld}</strong> not found. Try a full domain like <code>name.flr</code>
          </p>
        </div>
      )}

      {domain && domainName && (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {domainName}<span className="text-[var(--accent)]">{tld}</span>
            </h2>
            <p className="text-sm text-[var(--muted)]">on {domain.chainName}</p>
          </div>

          {holderLoading ? (
            <p className="text-center text-[var(--muted)]">Loading...</p>
          ) : isAvailable ? (
            <div className="text-center space-y-4">
              <div className="p-4 rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/20">
                <p className="text-[var(--success)] font-medium">This domain is available!</p>
              </div>
              <Link
                href={`/domain/${domain.slug}?name=${encodeURIComponent(domainName)}`}
                className="inline-block px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
              >
                Mint {domainName}{tld}
              </Link>
            </div>
          ) : isTaken ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--card-border)]">
                <p className="text-sm text-[var(--muted)] mb-1">Owner</p>
                <p className="text-sm font-mono break-all">{holder}</p>
              </div>

              {domain && tokenId !== undefined && tokenId > 0n && (
                <DomainImage domain={domain} tokenId={tokenId} />
              )}

              {customImage && (
                <div className="space-y-2">
                  <h3 className="font-medium">Custom Image</h3>
                  <div className="rounded-xl overflow-hidden border border-[var(--card-border)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={customImage} alt="Custom domain image" className="w-full max-w-[300px] mx-auto" />
                  </div>
                </div>
              )}

              <DomainDataDisplay dataStr={domainData as string | undefined} />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-12 text-center text-[var(--muted)]">Loading...</div>}>
      <SearchPageInner />
    </Suspense>
  );
}
