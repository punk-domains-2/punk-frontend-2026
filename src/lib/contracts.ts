export const tldAbi = [
  { inputs: [{ name: "_domainName", type: "string" }], name: "getDomainHolder", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_domainName", type: "string" }], name: "getDomainData", outputs: [{ name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_domainName", type: "string" }, { name: "_domainHolder", type: "address" }, { name: "_referrer", type: "address" }], name: "mint", outputs: [{ name: "", type: "uint256" }], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "_domainName", type: "string" }, { name: "_data", type: "string" }], name: "editData", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_domainName", type: "string" }], name: "editDefaultDomain", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_tokenId", type: "uint256" }], name: "tokenURI", outputs: [{ name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "string" }], name: "domains", outputs: [{ name: "name", type: "string" }, { name: "tokenId", type: "uint256" }, { name: "holder", type: "address" }, { name: "data", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "address" }], name: "defaultNames", outputs: [{ name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "price", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "buyingEnabled", outputs: [{ name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalSupply", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "nameMaxLength", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
] as const;

export const minterAbi = [
  { inputs: [{ name: "_domainName", type: "string" }, { name: "_domainHolder", type: "address" }, { name: "_referrer", type: "address" }], name: "mint", outputs: [{ name: "tokenId", type: "uint256" }], stateMutability: "payable", type: "function" },
  { inputs: [], name: "paused", outputs: [{ name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "price", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "price1char", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "price2char", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "price3char", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "price4char", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "price5char", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "price6char", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
] as const;

export const resolverAbi = [
  { inputs: [{ name: "_addr", type: "address" }], name: "getFirstDefaultDomain", outputs: [{ name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_addr", type: "address" }], name: "getDefaultDomains", outputs: [{ name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_domainName", type: "string" }, { name: "_tld", type: "string" }], name: "setCustomDefaultDomain", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const;

export const erc20Abi = [
  { inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], name: "approve", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], name: "allowance", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], name: "transfer", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "decimals", outputs: [{ name: "", type: "uint8" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "symbol", outputs: [{ name: "", type: "string" }], stateMutability: "view", type: "function" },
] as const;
