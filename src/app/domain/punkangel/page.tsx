"use client";

import { Suspense } from "react";
import MintPage from "@/components/MintPage";
import { getDomainBySlug } from "@/lib/domains";

const domain = getDomainBySlug("punkangel")!;

export default function PunkangelPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-12 text-center text-[var(--muted)]">Loading...</div>}>
      <MintPage domain={domain} />
    </Suspense>
  );
}
