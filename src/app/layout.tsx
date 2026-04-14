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
  metadataBase: new URL("https://punk.domains"),
  title: "Punk Domains",
  description: "Mint and manage web3 domain names across multiple chains",
  openGraph: {
    title: "Punk Domains",
    description: "Mint and manage web3 domain names across multiple chains",
    url: "https://punk.domains",
    siteName: "Punk Domains",
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
    title: "Punk Domains",
    description: "Mint and manage web3 domain names across multiple chains",
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
