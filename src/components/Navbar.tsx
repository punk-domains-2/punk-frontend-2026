"use client";

import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { resolverAbi } from "@/lib/contracts";
import { getResolverAddress } from "@/lib/domains";
import { getPreferredDomainKey, cacheGet } from "@/lib/cache";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;
  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg hover:bg-[var(--card)] transition-colors"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
      )}
    </button>
  );
}

function UserDomainName() {
  const { address, chainId } = useAccount();
  const resolverAddr = chainId ? getResolverAddress(chainId) : null;

  const { data: defaultDomain } = useReadContract({
    address: resolverAddr as `0x${string}`,
    abi: resolverAbi,
    functionName: "getFirstDefaultDomain",
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: !!address && !!resolverAddr },
  });

  const [preferred, setPreferred] = useState<string | null>(null);

  useEffect(() => {
    if (address && chainId) {
      const cached = cacheGet<string>(getPreferredDomainKey(address, chainId));
      if (cached) setPreferred(cached);
    }
  }, [address, chainId]);

  const displayName = preferred || (defaultDomain && defaultDomain !== "" ? defaultDomain : null);

  if (!displayName) return null;
  return (
    <span className="text-sm text-[var(--accent)] font-medium hidden sm:inline truncate max-w-[150px]">
      {displayName}
    </span>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/send", label: "Send" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[var(--background)]/80 border-b border-[var(--card-border)]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0 flex items-center gap-2">
          <Image src="/logo.svg" alt="" width={140} height={36} priority className="h-[36px] w-auto" />
          <span className="text-xl tracking-wide uppercase text-[var(--accent)]" style={{ fontFamily: "var(--font-impact)" }}>
            Punk Domains
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <UserDomainName />
          <ThemeToggle />
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
          <button
            className="md:hidden p-2 rounded-lg hover:bg-[var(--card)] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[var(--card-border)] bg-[var(--background)] px-4 py-3 space-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block py-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
