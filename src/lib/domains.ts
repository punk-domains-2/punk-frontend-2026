import domainsData from "../../data/domains.json";
import resolversData from "../../data/resolvers.json";
import tokensData from "../../data/tokens.json";

export interface DomainConfig {
  tld: string;
  slug: string;
  chainId: number;
  chainName: string;
  address: `0x${string}`;
  minter: `0x${string}` | "";
  differentPrices: number;
  currency: string;
  currencyAddress: `0x${string}` | "";
  currencyDecimals: number;
  show: boolean;
  website: string;
}

const raw = domainsData as Record<string, {
  chainId: number;
  chainName: string;
  address: string;
  minter: string;
  differentPrices: number;
  currency: string;
  currencyAddress: string;
  currencyDecimals?: number;
  show: boolean;
  website: string;
}>;

export const domains: DomainConfig[] = Object.entries(raw).map(([key, val]) => ({
  tld: key,
  slug: key.replace(".", ""),
  chainId: val.chainId,
  chainName: val.chainName,
  address: val.address as `0x${string}`,
  minter: (val.minter || "") as `0x${string}` | "",
  differentPrices: val.differentPrices,
  currency: val.currency,
  currencyAddress: (val.currencyAddress || "") as `0x${string}` | "",
  currencyDecimals: val.currencyDecimals ?? 18,
  show: val.show,
  website: val.website,
}));

export const visibleDomains = domains.filter((d) => d.show);

export function getDomainBySlug(slug: string): DomainConfig | undefined {
  return domains.find((d) => d.slug === slug);
}

export function getDomainByTld(tld: string): DomainConfig | undefined {
  const key = tld.startsWith(".") ? tld : `.${tld}`;
  return domains.find((d) => d.tld === key);
}

export const resolvers = resolversData as Record<string, string>;

export function getResolverAddress(chainId: number): `0x${string}` | null {
  const addr = resolvers[String(chainId)];
  return addr ? (addr as `0x${string}`) : null;
}

export const tokens = tokensData as Record<string, Record<string, string>>;

export function getTokensForChain(chainId: number): { symbol: string; address: `0x${string}` }[] {
  const chainTokens = tokens[String(chainId)];
  if (!chainTokens) return [];
  return Object.entries(chainTokens).map(([symbol, address]) => ({
    symbol,
    address: address as `0x${string}`,
  }));
}

export function hasMinter(domain: DomainConfig): boolean {
  return domain.minter !== "";
}

export function hasErc20Payment(domain: DomainConfig): boolean {
  return domain.currencyAddress !== "";
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;
export const REFERRER_ADDRESS = ZERO_ADDRESS;
