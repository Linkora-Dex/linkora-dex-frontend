import { ethers, BrowserProvider } from 'ethers';
import { writable } from 'svelte/store';
import { CONTRACT_ABIS } from './abis.js';
import { CONTRACT_ADDRESSES, SUPPORTED_TOKENS } from './config.js';

class BlockchainClient {
	constructor() {
		this.provider = null;
		this.signer = null;
		this.contracts = {};
		this.isConnected = writable(false);
		this.userAddress = writable(null);
		this.networkId = writable(null);
		this.error = writable(null);
		this.contractAddresses = writable(CONTRACT_ADDRESSES);
		this.supportedTokens = writable(SUPPORTED_TOKENS);
	}

	async init(config = {}) {
		try {
			const defaultConfig = {
				rpcUrl: 'http://localhost:8545',
				chainId: 31337,
				autoConnect: true
			};
			const finalConfig = { ...defaultConfig, ...config };

			if (typeof window !== 'undefined' && window.ethereum) {
				this.provider = new BrowserProvider(window.ethereum);
			} else {
				this.provider = new ethers.JsonRpcProvider(finalConfig.rpcUrl);
			}

			if (finalConfig.autoConnect) {
				await this.connectWallet();
			}

			await this.initializeContracts();

			console.log('✅ Blockchain client initialized');
			return true;
		} catch (error) {
			console.error('❌ Failed to initialize blockchain client:', error);
			this.error.set(error.message);
			return false;
		}
	}

	async connectWallet() {
		try {
			if (!window.ethereum) {
				throw new Error('MetaMask not found');
			}

			const accounts = await window.ethereum.request({
				method: 'eth_requestAccounts'
			});

			if (accounts.length === 0) {
				throw new Error('No accounts found');
			}

			this.signer = this.provider.getSigner();
			const userAddress = await this.signer.getAddress();
			const network = await this.provider.getNetwork();

			this.userAddress.set(userAddress);
			this.networkId.set(network.chainId);
			this.isConnected.set(true);
			this.error.set(null);

			console.log('✅ Wallet connected:', userAddress);
			return userAddress;
		} catch (error) {
			console.error('❌ Wallet connection failed:', error);
			this.error.set(error.message);
			throw error;
		}
	}

	async initializeContracts() {
		try {
			this.contracts = {
				router: new ethers.Contract(CONTRACT_ADDRESSES.Router, CONTRACT_ABIS.Router, this.signer || this.provider),
				pool: new ethers.Contract(CONTRACT_ADDRESSES.Pool, CONTRACT_ABIS.Pool, this.signer || this.provider),
				trading: new ethers.Contract(CONTRACT_ADDRESSES.Trading, CONTRACT_ABIS.Trading, this.signer || this.provider),
				oracle: new ethers.Contract(CONTRACT_ADDRESSES.Oracle, CONTRACT_ABIS.Oracle, this.signer || this.provider)
			};

    // Добавляем метод проверки существования пула, если его нет в ABI
    if (!this.contracts.router.lpExists) {
      this.contracts.router.lpExists = async (tokenAddress) => {
        try {
          // Пытаемся получить статистику пула
          await this.contracts.router.getLPStats(tokenAddress);
          return true;
        } catch (error) {
          // Если ошибка декодирования, значит пул не существует
          if (error.code === 'BAD_DATA' || error.message.includes('decode')) {
            return false;
          }
          throw error;
        }
      };
    }

			console.log('📜 Contracts initialized');
		} catch (error) {
			console.error('❌ Failed to initialize contracts:', error);
			throw error;
		}
	}

	formatToken(amount, decimals = 18) {
		if (!amount) return '0';
		return ethers.utils.formatUnits(amount.toString(), decimals);
	}

	parseToken(amount, decimals = 18) {
		return ethers.utils.parseUnits(amount.toString(), decimals);
	}

	getTokenConfig(tokenSymbolOrAddress) {
		if (SUPPORTED_TOKENS[tokenSymbolOrAddress]) {
			return SUPPORTED_TOKENS[tokenSymbolOrAddress];
		}

		return Object.values(SUPPORTED_TOKENS).find(token =>
			token.address.toLowerCase() === tokenSymbolOrAddress.toLowerCase()
		);
	}

	async waitForTransaction(tx, confirmations = 1) {
		try {
			console.log(`⏳ Waiting for transaction: ${tx.hash}`);
			const receipt = await tx.wait(confirmations);
			console.log(`✅ Transaction confirmed: ${tx.hash}`);
			return receipt;
		} catch (error) {
			console.error(`❌ Transaction failed: ${tx.hash}`, error);
			throw error;
		}
	}

	async estimateGas(contractMethod, ...args) {
		try {
			const gasEstimate = await contractMethod.estimateGas(...args);
			return gasEstimate.mul(120).div(100);
		} catch (error) {
			console.warn('⚠️ Gas estimation failed, using default');
			return ethers.BigNumber.from('500000');
		}
	}

	onAccountsChanged(callback) {
		if (window.ethereum) {
			window.ethereum.on('accountsChanged', callback);
		}
	}

	onChainChanged(callback) {
		if (window.ethereum) {
			window.ethereum.on('chainChanged', callback);
		}
	}

	async switchToNetwork(chainId) {
		try {
			await window.ethereum.request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: ethers.utils.hexValue(chainId) }]
			});
		} catch (error) {
			console.error('❌ Failed to switch network:', error);
			throw error;
		}
	}
}

export const blockchainClient = new BlockchainClient();