"use client";

import sdk from "@farcaster/miniapp-sdk";

let initialized = false;

export async function initFarcaster() {
  if (initialized || typeof window === "undefined") return;
  try {
    const context = await sdk.context;
    if (context) {
      await sdk.actions.ready();
      initialized = true;
    }
  } catch {
    // Not running inside Farcaster, safe to ignore
  }
}
