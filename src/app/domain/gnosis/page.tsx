"use client";

import { Suspense } from "react";
import MintPage from "@/components/MintPage";
import { getDomainBySlug } from "@/lib/domains";

const domain = getDomainBySlug("gnosis")!;

export default function GnosisPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-12 text-center text-[var(--muted)]">Loading...</div>}>
      <MintPage domain={domain} />
    </Suspense>
  );
}
