"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { visibleDomains, domains } from "@/lib/domains";

export default function HomePage() {
  const [name, setName] = useState("");
  const [selectedTld, setSelectedTld] = useState(visibleDomains[0]?.tld || "");
  const [tldOpen, setTldOpen] = useState(false);
  const [tldSearch, setTldSearch] = useState("");
  const tldRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filteredDomains = tldSearch.trim()
    ? domains.filter((d) =>
        d.tld.toLowerCase().includes(tldSearch.trim().toLowerCase())
      )
    : domains;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tldRef.current && !tldRef.current.contains(e.target as Node)) {
        setTldOpen(false);
        setTldSearch("");
      }
    }
    if (tldOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [tldOpen]);

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
          <div ref={tldRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setTldOpen((o) => !o);
                setTldSearch("");
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)] focus:outline-none cursor-pointer whitespace-nowrap w-full sm:w-auto"
            >
              <span>{selectedTld}</span>
              <svg
                className={`w-4 h-4 text-[var(--muted)] transition-transform ${tldOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {tldOpen && (
              <div className="absolute right-0 bottom-full mb-2 z-50 w-52 rounded-xl bg-[var(--card)] border border-[var(--card-border)] shadow-lg overflow-hidden">
                <div className="p-2 border-b border-[var(--card-border)]">
                  <input
                    autoFocus
                    type="text"
                    value={tldSearch}
                    onChange={(e) => setTldSearch(e.target.value)}
                    placeholder="Search extensions…"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--background)] text-sm focus:outline-none border border-[var(--card-border)]"
                  />
                </div>
                <ul className="max-h-52 overflow-y-auto">
                  {filteredDomains.length > 0 ? (
                    filteredDomains.map((d) => (
                      <li key={d.tld}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTld(d.tld);
                            setTldOpen(false);
                            setTldSearch("");
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--background)] transition-colors ${
                            d.tld === selectedTld ? "text-[var(--accent)] font-medium" : ""
                          }`}
                        >
                          {d.tld}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-sm text-[var(--muted)]">No matches</li>
                  )}
                </ul>
              </div>
            )}
          </div>
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
