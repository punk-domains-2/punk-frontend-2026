import type { Metadata } from "next";
import localFont from "next/font/local";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const impact = localFont({
  src: "../../public/font/impact.ttf",
  variable: "--font-impact",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://app.punk.domains"),
  title: "Punk Domains - Permissionless Web3 Domains",
  description: "Punk Domains is a decentralized domain name service offering a wide range of unique top-level domains powered across multiple blockchains.",
  openGraph: {
    title: "Punk Domains - Permissionless Web3 Domains",
    description: "Punk Domains is a decentralized domain name service offering a wide range of unique top-level domains powered across multiple blockchains.",
    url: "https://app.punk.domains",
    siteName: "Punk Domains - Permissionless Web3 Domains",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "Punk Domains",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Punk Domains - Permissionless Web3 Domains",
    description: "Punk Domains is a decentralized domain name service offering a wide range of unique top-level domains powered across multiple blockchains.",
    images: ["/preview.png"],
  },
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png" },
    ],
    other: [
      { rel: "manifest", url: "/favicon/site.webmanifest" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={impact.variable}>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
