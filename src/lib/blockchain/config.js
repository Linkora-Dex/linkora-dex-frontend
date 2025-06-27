import { ethers } from 'ethers';
/**
 * Конфигурационный файл для блокчейн-взаимодействия
 */


export const CONTRACT_ADDRESSES = {
	Router: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
	Pool: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
	Trading: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
	Oracle: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
	AccessControl: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
};

export const SUPPORTED_TOKENS = {
	ETH: {
		// address: ethers.constants.AddressZero,
		address: ethers.ZeroAddress,
		decimals: 18,
		symbol: 'ETH',
		name: 'Ethereum'
	},
	CAPY: {
		address: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
		decimals: 6,
		symbol: 'CAPY',
		name: 'Capybara Token'
	},
	AXOL: {
		address: "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
		decimals: 6,
		symbol: 'AXOL',
		name: 'Axolotl Token'
	},
	QUOK: {
		address: "0x68B1D87F95878fE05B998F19b66F4baba5De1aed",
		decimals: 8,
		symbol: 'QUOK',
		name: 'Quokka Coin'
	},
	PANG: {
		address: "0x59b670e9fA9D0A427751Af201D676719a970857b",
		decimals: 18,
		symbol: 'PANG',
		name: 'Pangolin Token'
	},
	NARW: {
		address: "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f",
		decimals: 18,
		symbol: 'NARW',
		name: 'Narwhal Token'
	}
};

export const NETWORK_CONFIG = {
	localhost: {
		chainId: 31337,
		name: 'Localhost',
		rpcUrl: 'http://localhost:8545',
		blockExplorer: null
	},
	mainnet: {
		chainId: 1,
		name: 'Ethereum Mainnet',
		rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
		blockExplorer: 'https://etherscan.io'
	}
};

export const TRADING_CONFIG = {
	MAX_LEVERAGE: 100,
	MIN_LEVERAGE: 1,
	LIQUIDATION_THRESHOLD: 90,
	DEFAULT_SLIPPAGE: 0.5,
	MAX_SLIPPAGE: 10,
	SWAP_FEE: 0.3,
	KEEPER_REWARD: 0.1,
	LIQUIDATION_REWARD: 5
};