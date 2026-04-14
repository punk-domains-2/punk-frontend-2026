"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { visibleDomains, domains } from "@/lib/domains";

export default function HomePage() {
  const [name, setName] = useState("");
  const [selectedTld, setSelectedTld] = useState(visibleDomains[0]?.tld || "");
  const router = useRouter();

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!cleanName || !selectedTld) return;
    const slug = selectedTld.replace(".", "");
    router.push(`/domain/${slug}?name=${encodeURIComponent(cleanName)}`);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Your <span className="text-[var(--accent)]">Web3</span> identity starts here
        </h1>
        <p className="text-lg text-[var(--muted)] max-w-xl mx-auto">
          Mint domain names across multiple chains. Own your name, control your data.
        </p>
      </div>

      <form onSubmit={handleCheck} className="max-w-xl mx-auto mb-16">
        <div className="flex flex-col sm:flex-row gap-2 p-2 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
            placeholder="Search for a domain"
            className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-lg"
          />
          <select
            value={selectedTld}
            onChange={(e) => setSelectedTld(e.target.value)}
            className="px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)] focus:outline-none cursor-pointer"
          >
            {domains.map((d) => (
              <option key={d.tld} value={d.tld}>{d.tld}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            Check availability
          </button>
        </div>
      </form>

      <div>
        <h2 className="text-xl font-bold mb-6 text-center">Available domain extensions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleDomains.map((d) => (
            <Link
              key={d.tld}
              href={`/domain/${d.slug}`}
              className="group p-6 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl hover:border-[var(--accent)] transition-colors"
            >
              <div className="text-2xl font-bold text-[var(--accent)] mb-2">{d.tld}</div>
              <div className="text-sm text-[var(--muted)]">
                <p>{d.chainName}</p>
                <p>Pay with {d.currency}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
