"use client";

import { useState, useMemo, useEffect } from "react";
import { useAccount, useSendTransaction, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseEther, parseUnits } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { getDomainByTld, getTokensForChain, ZERO_ADDRESS } from "@/lib/domains";
import { erc20Abi } from "@/lib/contracts";
import { useDomainHolder } from "@/hooks/useDomainLookup";

function useTokenDecimals(tokenAddress: `0x${string}` | undefined, chainId: number | undefined, isNative: boolean) {
  const { data } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
    chainId,
    query: { enabled: !isNative && !!tokenAddress },
  });
  return isNative ? 18 : (data as number) ?? 18;
}

export default function SendPage() {
  const { address, chainId } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<`0x${string}` | null>(null);

  const { domainName, tld, domain } = useMemo(() => {
    const lastDot = recipient.lastIndexOf(".");
    if (lastDot < 1) return { domainName: "", tld: "", domain: undefined };
    const name = recipient.slice(0, lastDot).toLowerCase();
    const ext = recipient.slice(lastDot).toLowerCase();
    return { domainName: name, tld: ext, domain: getDomainByTld(ext) };
  }, [recipient]);

  const { holder, isTaken, isLoading: holderLoading } = useDomainHolder(domain, domainName);

  const tokens = useMemo(() => chainId ? getTokensForChain(chainId) : [], [chainId]);

  useEffect(() => {
    if (tokens.length > 0 && !selectedToken) setSelectedToken(tokens[0].symbol);
  }, [tokens, selectedToken]);

  const token = tokens.find((t) => t.symbol === selectedToken);
  const isNative = token?.address === "0x0" || token?.address === ("0x0000000000000000000000000000000000000000" as `0x${string}`);
  const decimals = useTokenDecimals(token?.address, chainId, isNative);

  const { sendTransaction, data: nativeTxHash, isPending: nativePending } = useSendTransaction();
  const { writeContract: erc20Transfer, data: erc20TxHash, isPending: erc20Pending } = useWriteContract();
  const txHash = nativeTxHash || erc20TxHash;
  const { isSuccess: txConfirmed, isLoading: txConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  function handleResolve() {
    if (!isTaken || !holder || holder === ZERO_ADDRESS) return;
    setResolvedAddress(holder);
    setShowModal(true);
  }

  function handleSend() {
    if (!resolvedAddress || !amount) return;
    setShowModal(false);

    if (isNative) {
      sendTransaction({
        to: resolvedAddress,
        value: parseEther(amount),
      });
    } else if (token) {
      erc20Transfer({
        address: token.address,
        abi: erc20Abi,
        functionName: "transfer",
        args: [resolvedAddress, parseUnits(amount, decimals)],
        chainId,
      });
    }
  }

  if (!address) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <h1 className="text-3xl font-bold">Send Tokens</h1>
        <p className="text-[var(--muted)]">Connect your wallet to send tokens to domain holders.</p>
        <div className="flex justify-center"><ConnectButton /></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Send Tokens</h1>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 space-y-6">
        {txConfirmed ? (
          <div className="text-center space-y-4">
            <div className="text-[var(--success)] text-5xl">&#10003;</div>
            <h2 className="text-xl font-bold">Tokens sent!</h2>
            {txHash && <p className="text-xs text-[var(--muted)] break-all">TX: {txHash}</p>}
            <button
              onClick={() => { setRecipient(""); setAmount(""); setResolvedAddress(null); }}
              className="px-6 py-2 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              Send more
            </button>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Recipient domain</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. tempe.flr"
                className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              {domainName && domain && (
                <div className="mt-2 text-sm">
                  {holderLoading ? (
                    <span className="text-[var(--muted)]">Resolving...</span>
                  ) : isTaken ? (
                    <span className="text-[var(--success)]">Domain found &middot; Owner: {holder?.slice(0, 6)}...{holder?.slice(-4)}</span>
                  ) : (
                    <span className="text-[var(--error)]">Domain not registered</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Token</label>
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)] focus:outline-none cursor-pointer"
              >
                {tokens.map((t) => (
                  <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, "");
                  if ((v.match(/\./g) || []).length <= 1) setAmount(v);
                }}
                placeholder="0.0"
                className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            <button
              onClick={handleResolve}
              disabled={!isTaken || !amount || nativePending || erc20Pending || txConfirming}
              className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {nativePending || erc20Pending ? "Sending..." : txConfirming ? "Confirming..." : "Send"}
            </button>
          </>
        )}
      </div>

      {showModal && resolvedAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Confirm transfer</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-[var(--muted)]">To:</span> {recipient}</p>
              <p className="font-mono break-all text-xs bg-[var(--background)] p-3 rounded-lg border border-[var(--card-border)]">{resolvedAddress}</p>
              <p><span className="text-[var(--muted)]">Amount:</span> {amount} {selectedToken}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-[var(--card-border)] hover:bg-[var(--background)] transition-colors">Cancel</button>
              <button onClick={handleSend} className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
