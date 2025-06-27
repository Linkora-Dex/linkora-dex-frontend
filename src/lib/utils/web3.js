import { ethers } from 'ethers';

export const DEPLOYED_ADDRESSES = {
  AccessControl: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  Oracle: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
  Pool: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
  Trading: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
  Router: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",

  CAPY: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
  AXOL: "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
  QUOK: "0x68B1D87F95878fE05B998F19b66F4baba5De1aed",
  PANG: "0x59b670e9fA9D0A427751Af201D676719a970857b",
  NARW: "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f"
};

export const CONSTANTS = {
  ETH_ADDRESS: ethers.constants.AddressZero,
  MAX_UINT256: ethers.constants.MaxUint256,

  SWAP_FEE: 30,
  KEEPER_REWARD: 10,
  LIQUIDATION_REWARD: 500,

  MAX_LEVERAGE: 100,
  LIQUIDATION_THRESHOLD: 90,
  MAX_SLIPPAGE: 50,

  PRICE_STALENESS: 3600,
  KEEPER_INTERVAL: 5000,
};

export async function connectWallet() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not found');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    return {
      provider,
      signer,
      address: accounts[0]
    };
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
}

export function formatAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTokenAmount(amount, decimals = 18) {
  try {
    return ethers.utils.formatUnits(amount, decimals);
  } catch {
    return '0';
  }
}

export function parseTokenAmount(amount, decimals = 18) {
  try {
    return ethers.utils.parseUnits(amount.toString(), decimals);
  } catch {
    return ethers.BigNumber.from(0);
  }
}

export function formatPrice(price) {
  const num = parseFloat(price);
  if (num >= 1000) {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return num.toFixed(6);
}