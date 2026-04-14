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

const WalletIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

function MobileWalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        return (
          <div
            className="md:hidden"
            {...(!ready && { "aria-hidden": true, style: { opacity: 0, pointerEvents: "none", userSelect: "none" } })}
          >
            <button
              onClick={connected ? openAccountModal : openConnectModal}
              className="p-2 rounded-lg hover:bg-[var(--card)] transition-colors"
              aria-label={connected ? "Open account" : "Connect wallet"}
            >
              <WalletIcon />
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

function MobileChainSwitcher({ onSelect }: { onSelect: () => void }) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openChainModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        if (!connected) return null;
        return (
          <button
            onClick={() => { openChainModal(); onSelect(); }}
            className="flex items-center gap-2 py-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors w-full"
          >
            {chain.hasIcon && chain.iconUrl ? (
              <div className="w-5 h-5 rounded-full overflow-hidden shrink-0" style={{ background: chain.iconBackground }}>
                <img src={chain.iconUrl} alt={chain.name ?? "Chain"} className="w-5 h-5" />
              </div>
            ) : (
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            )}
            <span className="text-sm">{chain.name ?? "Switch Network"}</span>
            <svg className="w-4 h-4 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}

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
          {/* Theme toggle: desktop only */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          {/* Full connect button: desktop only */}
          <div className="hidden md:block">
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
          </div>
          {/* Wallet icon button: mobile only */}
          <MobileWalletButton />
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
          <div className="border-t border-[var(--card-border)] pt-3 mt-1 space-y-1">
            <MobileChainSwitcher onSelect={() => setMenuOpen(false)} />
            <div className="flex items-center gap-2 py-1">
              <ThemeToggle />
              <span className="text-sm text-[var(--muted)]">Toggle theme</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
