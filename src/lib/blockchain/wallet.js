import { blockchainClient } from './client.js';
import { ethers } from 'ethers';

class WalletManager {
	async depositETH(amount) {
		try {
			const amountParsed = blockchainClient.parseToken(amount, 18);
			const tx = await blockchainClient.contracts.router.depositETH({ value: amountParsed });
			return await blockchainClient.waitForTransaction(tx);
		} catch (error) {
			console.error('❌ Failed to deposit ETH:', error);
			throw error;
		}
	}

	async depositToken(tokenSymbol, amount) {
		try {
			const tokenConfig = blockchainClient.getTokenConfig(tokenSymbol);
			if (!tokenConfig) {
				throw new Error('Invalid token');
			}

			const amountParsed = blockchainClient.parseToken(amount, tokenConfig.decimals);

			const tx = await blockchainClient.contracts.router.depositToken(
				tokenConfig.address,
				amountParsed
			);
			return await blockchainClient.waitForTransaction(tx);
		} catch (error) {
			console.error('❌ Failed to deposit token:', error);
			throw error;
		}
	}

	async withdrawETH(amount) {
		try {
			const amountParsed = blockchainClient.parseToken(amount, 18);
			const tx = await blockchainClient.contracts.router.withdrawETH(amountParsed);
			return await blockchainClient.waitForTransaction(tx);
		} catch (error) {
			console.error('❌ Failed to withdraw ETH:', error);
			throw error;
		}
	}

	async withdrawToken(tokenSymbol, amount) {
		try {
			const tokenConfig = blockchainClient.getTokenConfig(tokenSymbol);
			if (!tokenConfig) {
				throw new Error('Invalid token');
			}

			const amountParsed = blockchainClient.parseToken(amount, tokenConfig.decimals);

			const tx = await blockchainClient.contracts.router.withdrawToken(
				tokenConfig.address,
				amountParsed
			);
			return await blockchainClient.waitForTransaction(tx);
		} catch (error) {
			console.error('❌ Failed to withdraw token:', error);
			throw error;
		}
	}

	async claimLPRewards(tokenSymbol) {
		try {
			const tokenConfig = blockchainClient.getTokenConfig(tokenSymbol);
			if (!tokenConfig) {
				throw new Error('Invalid token');
			}

			const tx = await blockchainClient.contracts.router.claimLPFees(tokenConfig.address);
			return await blockchainClient.waitForTransaction(tx);
		} catch (error) {
			console.error('❌ Failed to claim LP rewards:', error);
			throw error;
		}
	}

	async getWalletBalance(tokenSymbol) {
		try {
			const userAddress = await new Promise(resolve => {
				blockchainClient.userAddress.subscribe(value => resolve(value))();
			});

			if (!userAddress) {
				throw new Error('Wallet not connected');
			}

			if (tokenSymbol === 'ETH') {
				const balance = await blockchainClient.provider.getBalance(userAddress);
				return blockchainClient.formatToken(balance, 18);
			} else {
				const tokenConfig = blockchainClient.getTokenConfig(tokenSymbol);
				if (!tokenConfig) {
					throw new Error('Invalid token');
				}

				const tokenContract = new ethers.Contract(
					tokenConfig.address,
					['function balanceOf(address) view returns (uint256)'],
					blockchainClient.provider
				);

				const balance = await tokenContract.balanceOf(userAddress);
				return blockchainClient.formatToken(balance, tokenConfig.decimals);
			}
		} catch (error) {
			console.error('❌ Failed to get wallet balance:', error);
			return '0';
		}
	}

	async approveToken(tokenSymbol, spenderAddress, amount) {
		try {
			const tokenConfig = blockchainClient.getTokenConfig(tokenSymbol);
			if (!tokenConfig || tokenConfig.address === ethers.constants.AddressZero) {
				throw new Error('Cannot approve ETH');
			}

			const tokenContract = new ethers.Contract(
				tokenConfig.address,
				[
					'function approve(address spender, uint256 amount) returns (bool)',
					'function allowance(address owner, address spender) view returns (uint256)'
				],
				blockchainClient.signer
			);

			const amountParsed = amount === 'max'
				? ethers.constants.MaxUint256
				: blockchainClient.parseToken(amount, tokenConfig.decimals);

			const tx = await tokenContract.approve(spenderAddress, amountParsed);
			return await blockchainClient.waitForTransaction(tx);
		} catch (error) {
			console.error('❌ Failed to approve token:', error);
			throw error;
		}
	}

	async getTokenAllowance(tokenSymbol, spenderAddress) {
		try {
			const userAddress = await new Promise(resolve => {
				blockchainClient.userAddress.subscribe(value => resolve(value))();
			});

			if (!userAddress) {
				return '0';
			}

			const tokenConfig = blockchainClient.getTokenConfig(tokenSymbol);
			if (!tokenConfig || tokenConfig.address === ethers.constants.AddressZero) {
				return 'unlimited';
			}

			const tokenContract = new ethers.Contract(
				tokenConfig.address,
				['function allowance(address owner, address spender) view returns (uint256)'],
				blockchainClient.provider
			);

			const allowance = await tokenContract.allowance(userAddress, spenderAddress);
			return blockchainClient.formatToken(allowance, tokenConfig.decimals);
		} catch (error) {
			console.error('❌ Failed to get token allowance:', error);
			return '0';
		}
	}

	async validateTransaction(operation, params) {
		try {
			const userAddress = await new Promise(resolve => {
				blockchainClient.userAddress.subscribe(value => resolve(value))();
			});

			if (!userAddress) {
				return { valid: false, error: 'Wallet not connected' };
			}

			switch (operation) {
				case 'deposit':
					return await this.validateDeposit(params);
				case 'withdraw':
					return await this.validateWithdraw(params);
				case 'approve':
					return await this.validateApprove(params);
				default:
					return { valid: false, error: 'Unknown operation' };
			}
		} catch (error) {
			return { valid: false, error: error.message };
		}
	}

	async validateDeposit({ tokenSymbol, amount }) {
		const walletBalance = await this.getWalletBalance(tokenSymbol);

		if (parseFloat(amount) > parseFloat(walletBalance)) {
			return { valid: false, error: 'Insufficient wallet balance' };
		}

		if (tokenSymbol !== 'ETH') {
			const tokenConfig = blockchainClient.getTokenConfig(tokenSymbol);
			const allowance = await this.getTokenAllowance(tokenSymbol, tokenConfig.address);

			if (parseFloat(amount) > parseFloat(allowance)) {
				return {
					valid: false,
					error: 'Insufficient allowance',
					needsApproval: true
				};
			}
		}

		return { valid: true };
	}

	async validateWithdraw({ tokenSymbol, amount }) {
		const userAddress = await new Promise(resolve => {
			blockchainClient.userAddress.subscribe(value => resolve(value))();
		});

		const tokenConfig = blockchainClient.getTokenConfig(tokenSymbol);
		const availableBalance = await blockchainClient.contracts.router.getAvailableBalance(
			userAddress,
			tokenConfig.address
		);

		const availableFormatted = blockchainClient.formatToken(availableBalance, tokenConfig.decimals);

		if (parseFloat(amount) > parseFloat(availableFormatted)) {
			return { valid: false, error: 'Insufficient available balance in pool' };
		}

		return { valid: true };
	}

	async validateApprove({ tokenSymbol, amount, spender }) {
		if (tokenSymbol === 'ETH') {
			return { valid: false, error: 'ETH does not require approval' };
		}

		const walletBalance = await this.getWalletBalance(tokenSymbol);

		if (amount !== 'max' && parseFloat(amount) > parseFloat(walletBalance)) {
			return { valid: false, error: 'Amount exceeds wallet balance' };
		}

		return { valid: true };
	}

	async getTransactionHistory(limit = 50) {
		try {
			const userAddress = await new Promise(resolve => {
				blockchainClient.userAddress.subscribe(value => resolve(value))();
			});

			if (!userAddress) {
				return [];
			}

			const currentBlock = await blockchainClient.provider.getBlockNumber();
			const fromBlock = Math.max(0, currentBlock - 10000);

			const events = [];

			const depositFilter = blockchainClient.contracts.pool.filters.Deposit(userAddress);
			const depositEvents = await blockchainClient.contracts.pool.queryFilter(depositFilter, fromBlock);

			const withdrawFilter = blockchainClient.contracts.pool.filters.Withdrawal(userAddress);
			const withdrawEvents = await blockchainClient.contracts.pool.queryFilter(withdrawFilter, fromBlock);

			for (const event of [...depositEvents, ...withdrawEvents]) {
				const block = await event.getBlock();
				const tokenConfig = blockchainClient.getTokenConfig(event.args.token);

				events.push({
					type: event.event.toLowerCase(),
					hash: event.transactionHash,
					timestamp: block.timestamp * 1000,
					token: tokenConfig?.symbol || 'UNKNOWN',
					amount: blockchainClient.formatToken(event.args.amount, tokenConfig?.decimals || 18),
					blockNumber: event.blockNumber
				});
			}

			return events
				.sort((a, b) => b.timestamp - a.timestamp)
				.slice(0, limit);

		} catch (error) {
			console.error('❌ Failed to get transaction history:', error);
			return [];
		}
	}
}

export const walletManager = new WalletManager();