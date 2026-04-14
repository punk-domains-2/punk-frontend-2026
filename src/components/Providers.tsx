"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { ThemeProvider, useTheme } from "next-themes";
import { useState, useEffect, type ReactNode } from "react";
import { config } from "@/lib/wagmi";
import { initFarcaster } from "@/lib/farcaster";
import "@rainbow-me/rainbowkit/styles.css";

function RainbowKitThemeWrapper({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Use dark theme as the SSR default to match defaultTheme="dark",
  // then switch to the resolved value after hydration.
  const rkTheme = mounted && resolvedTheme === "light"
    ? lightTheme({ accentColor: "#8b5cf6" })
    : darkTheme({ accentColor: "#8b5cf6" });

  return (
    <RainbowKitProvider theme={rkTheme}>
      {children}
    </RainbowKitProvider>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    initFarcaster();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitThemeWrapper>
            {children}
          </RainbowKitThemeWrapper>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
