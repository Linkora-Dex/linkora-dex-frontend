import { writable } from 'svelte/store';
import { blockchainClient } from './client.js';
import { SUPPORTED_TOKENS } from './config.js';
import { ethers } from 'ethers';

class PortfolioManager {
	constructor() {
		this.portfolioData = writable({
			totalBalance: 0,
			pnl24h: 0,
			availableBalance: 0,
			lockedBalance: 0,
			totalCollateral: 0,
			freeCollateral: 0,
			lastUpdate: null
		});

		this.balances = writable({});
		this.positions = writable([]);
		this.orders = writable([]);
		this.lpRewards = writable({});
		this.history = writable([]);
		this.isLoading = writable(false);
	}

	async refreshPortfolio(userAddress) {
		if (!userAddress || !blockchainClient.contracts.router) {
			console.warn('⚠️ Cannot refresh portfolio: missing data');
			return;
		}

		this.isLoading.set(true);

		try {
			const [balances, positions, orders, lpRewards] = await Promise.all([
				this.getBalances(userAddress),
				this.getPositions(userAddress),
				this.getOrders(userAddress),
				this.getLPRewards(userAddress)
			]);

			const portfolioSummary = await this.calculatePortfolioSummary(balances, positions);

			this.balances.set(balances);
			this.positions.set(positions);
			this.orders.set(orders);
			this.lpRewards.set(lpRewards);
			this.portfolioData.set({
				...portfolioSummary,
				lastUpdate: Date.now()
			});

			console.log('✅ Portfolio refreshed');
		} catch (error) {
			console.error('❌ Portfolio refresh failed:', error);
		} finally {
			this.isLoading.set(false);
		}
	}

	async getBalances(userAddress) {
		const balances = {};

		try {
			for (const [symbol, tokenConfig] of Object.entries(SUPPORTED_TOKENS)) {
				const [total, available] = await Promise.all([
					blockchainClient.contracts.router.getBalance(userAddress, tokenConfig.address),
					blockchainClient.contracts.router.getAvailableBalance(userAddress, tokenConfig.address)
				]);

				const price = await this.getTokenPrice(tokenConfig.address);

				balances[symbol] = {
					symbol,
					address: tokenConfig.address,
					decimals: tokenConfig.decimals,
					total: blockchainClient.formatToken(total, tokenConfig.decimals),
					available: blockchainClient.formatToken(available, tokenConfig.decimals),
					locked: blockchainClient.formatToken(total.sub(available), tokenConfig.decimals),
					price: parseFloat(blockchainClient.formatToken(price, 18)),
					totalUSD: parseFloat(blockchainClient.formatToken(total, tokenConfig.decimals)) * parseFloat(blockchainClient.formatToken(price, 18)),
					availableUSD: parseFloat(blockchainClient.formatToken(available, tokenConfig.decimals)) * parseFloat(blockchainClient.formatToken(price, 18)),
					lockedUSD: parseFloat(blockchainClient.formatToken(total.sub(available), tokenConfig.decimals)) * parseFloat(blockchainClient.formatToken(price, 18))
				};
			}

			return balances;
		} catch (error) {
			console.error('❌ Failed to get balances:', error);
			return {};
		}
	}

	async getPositions(userAddress) {
		try {
			const positionIds = await blockchainClient.contracts.router.getUserPositions(userAddress);
			const positions = [];

			for (const positionId of positionIds) {
				const position = await blockchainClient.contracts.router.getPosition(positionId);

				if (!position.isOpen) continue;

				const currentPrice = await blockchainClient.contracts.router.getPrice(position.token);
				const tokenConfig = blockchainClient.getTokenConfig(position.token);

				const entryPriceFormatted = parseFloat(blockchainClient.formatToken(position.entryPrice, 18));
				const currentPriceFormatted = parseFloat(blockchainClient.formatToken(currentPrice, 18));
				const sizeFormatted = parseFloat(blockchainClient.formatToken(position.size, 18));
				const collateralFormatted = parseFloat(blockchainClient.formatToken(position.collateralAmount, 18));

				const isLong = position.positionType === 0;
				let pnlPercent = 0;
				let pnlUSD = 0;

				if (isLong) {
					pnlPercent = ((currentPriceFormatted - entryPriceFormatted) / entryPriceFormatted) * 100;
				} else {
					pnlPercent = ((entryPriceFormatted - currentPriceFormatted) / entryPriceFormatted) * 100;
				}

				pnlUSD = (pnlPercent / 100) * sizeFormatted;

				const liquidationPrice = this.calculateLiquidationPrice(position, isLong);

				positions.push({
					id: positionId.toString(),
					token: position.token,
					tokenSymbol: tokenConfig?.symbol || 'UNKNOWN',
					size: sizeFormatted,
					collateral: collateralFormatted,
					leverage: position.leverage.toString(),
					entryPrice: entryPriceFormatted,
					currentPrice: currentPriceFormatted,
					liquidationPrice: liquidationPrice,
					pnlPercent: pnlPercent,
					pnlUSD: pnlUSD,
					isLong: isLong,
					createdAt: position.createdAt.toNumber() * 1000,
					marginLevel: this.calculateMarginLevel(collateralFormatted, pnlUSD, sizeFormatted),
					status: pnlPercent <= -90 ? 'liquidatable' : pnlPercent <= -80 ? 'danger' : 'healthy'
				});
			}

			return positions;
		} catch (error) {
			console.error('❌ Failed to get positions:', error);
			return [];
		}
	}

	async getOrders(userAddress) {
		try {
			const orderIds = await blockchainClient.contracts.router.getUserOrders(userAddress);
			const orders = [];

			for (const orderId of orderIds) {
				const order = await blockchainClient.contracts.router.getOrder(orderId);

				if (order.executed) continue;

				const canExecute = await blockchainClient.contracts.router.shouldExecuteOrder(orderId);
				const tokenInConfig = blockchainClient.getTokenConfig(order.tokenIn);
				const tokenOutConfig = blockchainClient.getTokenConfig(order.tokenOut);

				orders.push({
					id: orderId.toString(),
					tokenIn: order.tokenIn,
					tokenOut: order.tokenOut,
					tokenInSymbol: tokenInConfig?.symbol || 'UNKNOWN',
					tokenOutSymbol: tokenOutConfig?.symbol || 'UNKNOWN',
					amountIn: blockchainClient.formatToken(order.amountIn, tokenInConfig?.decimals || 18),
					targetPrice: parseFloat(blockchainClient.formatToken(order.targetPrice, 18)),
					minAmountOut: blockchainClient.formatToken(order.minAmountOut, tokenOutConfig?.decimals || 18),
					orderType: order.orderType === 0 ? 'LIMIT' : 'STOP_LOSS',
					isLong: order.isLong,
					canExecute: canExecute,
					selfExecutable: order.selfExecutable,
					createdAt: order.createdAt.toNumber() * 1000,
					status: canExecute ? 'ready' : 'waiting'
				});
			}

			return orders;
		} catch (error) {
			console.error('❌ Failed to get orders:', error);
			return [];
		}
	}

	async getLPRewards(userAddress) {
		const lpRewards = {};

		try {
			for (const [symbol, tokenConfig] of Object.entries(SUPPORTED_TOKENS)) {
				const [lpInfo, claimableFees] = await Promise.all([
					blockchainClient.contracts.router.getUserLPInfo(userAddress, tokenConfig.address),
					blockchainClient.contracts.router.getClaimableLPFees(userAddress, tokenConfig.address)
				]);

				const contribution = blockchainClient.formatToken(lpInfo.contribution, tokenConfig.decimals);
				const claimable = blockchainClient.formatToken(claimableFees, tokenConfig.decimals);
				const totalClaimed = blockchainClient.formatToken(lpInfo.totalClaimed, tokenConfig.decimals);

				if (parseFloat(contribution) > 0) {
					lpRewards[symbol] = {
						symbol,
						contribution: parseFloat(contribution),
						sharePercentage: lpInfo.sharePercentage.toNumber() / 100,
						claimableFees: parseFloat(claimable),
						totalClaimed: parseFloat(totalClaimed),
						apr: await this.calculateLPAPR(symbol, contribution)
					};
				}
			}

			return lpRewards;
		} catch (error) {
			console.error('❌ Failed to get LP rewards:', error);
			return {};
		}
	}

	async calculatePortfolioSummary(balances, positions) {
		let totalBalance = 0;
		let availableBalance = 0;
		let lockedBalance = 0;
		let totalCollateral = 0;
		let totalPnL = 0;

		for (const balance of Object.values(balances)) {
			totalBalance += balance.totalUSD;
			availableBalance += balance.availableUSD;
			lockedBalance += balance.lockedUSD;
		}

		for (const position of positions) {
			totalCollateral += position.collateral;
			totalPnL += position.pnlUSD;
		}

		const freeCollateral = Math.max(0, totalCollateral - Math.abs(totalPnL));

		return {
			totalBalance: totalBalance + totalPnL,
			pnl24h: await this.calculate24hPnL(),
			availableBalance,
			lockedBalance,
			totalCollateral,
			freeCollateral
		};
	}

	async calculate24hPnL() {
		try {
			const currentBlock = await blockchainClient.provider.getBlockNumber();
			const fromBlock = currentBlock - 7200;

			const userAddress = await new Promise(resolve => {
				blockchainClient.userAddress.subscribe(value => resolve(value))();
			});

			if (!userAddress) return 0;

			const closedPositionsFilter = blockchainClient.contracts.trading.filters.PositionClosed(null, userAddress);
			const events = await blockchainClient.contracts.trading.queryFilter(closedPositionsFilter, fromBlock);

			return events.reduce((total, event) => {
				const pnl = parseFloat(blockchainClient.formatToken(event.args.pnl, 18));
				return total + pnl;
			}, 0);
		} catch (error) {
			console.error('❌ Failed to calculate 24h PnL:', error);
			return 0;
		}
	}

	async calculateLPAPR(symbol, contribution) {
		try {
			const stats = await blockchainClient.contracts.router.getLPStats(
				blockchainClient.getTokenConfig(symbol).address
			);

			const totalFees = parseFloat(blockchainClient.formatToken(stats.totalFeesAccumulated, 18));
			const totalContributions = parseFloat(blockchainClient.formatToken(stats.totalContributions, 18));

			if (totalContributions === 0) return 0;

			const feeYield = totalFees / totalContributions;
			return feeYield * 365 * 100;
		} catch (error) {
			console.error('❌ Failed to calculate LP APR:', error);
			return 0;
		}
	}

	calculateLiquidationPrice(position, isLong) {
		const entryPrice = parseFloat(blockchainClient.formatToken(position.entryPrice, 18));
		const leverage = position.leverage.toNumber();
		const liquidationThreshold = 90;

		if (isLong) {
			return entryPrice * (1 - liquidationThreshold / (100 * leverage));
		} else {
			return entryPrice * (1 + liquidationThreshold / (100 * leverage));
		}
	}

	calculateMarginLevel(collateral, pnl, size) {
		const equity = collateral + pnl;
		if (size === 0) return 100;
		return Math.max(0, (equity / size) * 100);
	}

	async getTokenPrice(tokenAddress) {
		try {
			return await blockchainClient.contracts.router.getPrice(tokenAddress);
		} catch (error) {
			console.error('❌ Failed to get token price:', error);
			return ethers.BigNumber.from(0);
		}
	}
}

export const portfolioManager = new PortfolioManager();