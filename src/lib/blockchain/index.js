import { blockchainClient } from './client.js';
import { portfolioManager } from './portfolio.js';
import { tradingManager } from './trading.js';
import { walletManager } from './wallet.js';
import { defiManager } from './defi.js';
import { CONTRACT_ADDRESSES, SUPPORTED_TOKENS, TRADING_CONFIG } from './config.js';

// Основные экспорты для использования в компонентах
export { blockchainClient };
export { portfolioManager };
export { tradingManager };
export { walletManager };
export { defiManager };

// Конфигурация
export { CONTRACT_ADDRESSES, SUPPORTED_TOKENS, TRADING_CONFIG };

// Сторы для реактивности
export const portfolio = portfolioManager.portfolioData;
export const balances = portfolioManager.balances;
export const positions = portfolioManager.positions;
export const orders = portfolioManager.orders;
export const lpRewards = portfolioManager.lpRewards;
export const history = portfolioManager.history;
export const isLoadingPortfolio = portfolioManager.isLoading;

// Сторы клиента
export const isConnected = blockchainClient.isConnected;
export const userAddress = blockchainClient.userAddress;
export const networkId = blockchainClient.networkId;
export const error = blockchainClient.error;

export class DexAPI {
	// Инициализация
	static async init(config = {}) {
		await blockchainClient.init(config);
		return this;
	}

	// Подключение кошелька
	static async connectWallet() {
		return await blockchainClient.connectWallet();
	}

	// Портфель
	static async refreshPortfolio() {
		const userAddr = await new Promise(resolve => {
			blockchainClient.userAddress.subscribe(value => resolve(value))();
		});
		if (userAddr) {
			await portfolioManager.refreshPortfolio(userAddr);
		}
	}

	// DeFi - Lending
	static async lendToken(token, amount) {
		return await defiManager.lendToken(token, amount);
	}

	static async withdrawFromLending(token, amount) {
		return await defiManager.withdrawFromLending(token, amount);
	}

	static async getLendingBalance(token) {
		return await defiManager.getLendingBalance(token);
	}

	static async getLendingPoolInfo(token) {
		return await defiManager.getLendingPoolInfo(token);
	}

	// DeFi - Liquidity Pools
	static async addLiquidity(token0, token1, amount0, amount1) {
		return await defiManager.addLiquidity(token0, token1, amount0, amount1);
	}

	static async removeLiquidity(token0, token1, lpAmount) {
		return await defiManager.removeLiquidity(token0, token1, lpAmount);
	}

	static async getLiquidityPoolInfo(token0, token1) {
		return await defiManager.getLiquidityPoolInfo(token0, token1);
	}

	static async getUserLPContribution(token0, token1) {
		return await defiManager.getUserLPContribution(token0, token1);
	}

	static async getClaimableFees(token) {
		return await defiManager.getClaimableFees(token);
	}

	static async claimFees(token) {
		return await defiManager.claimFees(token);
	}

	// Торговля
	static async swap(tokenIn, tokenOut, amount, slippage = 0.5) {
		return await tradingManager.swapTokens(tokenIn, tokenOut, amount, slippage);
	}

	static async createLimitOrder(tokenIn, tokenOut, amount, price, isLong = true) {
		return await tradingManager.createLimitOrder(tokenIn, tokenOut, amount, price, isLong);
	}

	static async createStopLoss(tokenIn, tokenOut, amount, stopPrice) {
		return await tradingManager.createStopLossOrder(tokenIn, tokenOut, amount, stopPrice);
	}

	static async openPosition(token, collateral, leverage, isLong) {
		return await tradingManager.openPosition(token, collateral, leverage, isLong);
	}

	static async closePosition(positionId) {
		return await tradingManager.closePosition(positionId);
	}

	static async cancelOrder(orderId) {
		return await tradingManager.cancelOrder(orderId);
	}

	static async executeOrder(orderId) {
		return await tradingManager.selfExecuteOrder(orderId);
	}

	// Кошелек
	static async deposit(token, amount) {
		if (token === 'ETH') {
			return await walletManager.depositETH(amount);
		} else {
			return await walletManager.depositToken(token, amount);
		}
	}

	static async withdraw(token, amount) {
		if (token === 'ETH') {
			return await walletManager.withdrawETH(amount);
		} else {
			return await walletManager.withdrawToken(token, amount);
		}
	}

	static async claimRewards(token) {
		return await walletManager.claimLPRewards(token);
	}

	// Вспомогательные функции
	static async getQuote(tokenIn, tokenOut, amount) {
		return await tradingManager.getQuote(tokenIn, tokenOut, amount);
	}

	static async getWalletBalance(token) {
		return await walletManager.getWalletBalance(token);
	}

	static async validateTransaction(operation, params) {
		return await walletManager.validateTransaction(operation, params);
	}

	static getTokenConfig(token) {
		return blockchainClient.getTokenConfig(token);
	}

	static formatToken(amount, decimals = 18) {
		return blockchainClient.formatToken(amount, decimals);
	}

	static parseToken(amount, decimals = 18) {
		return blockchainClient.parseToken(amount, decimals);
	}
}

// Автоматическая настройка при импорте модуля
blockchainClient.userAddress.subscribe(async (userAddress) => {
	if (userAddress) {
		await portfolioManager.refreshPortfolio(userAddress);

		// Обновляем портфель каждые 30 секунд
		if (typeof window !== 'undefined') {
			const existingInterval = window.__portfolioInterval;
			if (existingInterval) {
				clearInterval(existingInterval);
			}

			window.__portfolioInterval = setInterval(() => {
				portfolioManager.refreshPortfolio(userAddress);
			}, 30000);
		}
	}
});

// Обработка смены аккаунта
if (typeof window !== 'undefined') {
	blockchainClient.onAccountsChanged(async (accounts) => {
		if (accounts.length > 0) {
			await blockchainClient.connectWallet();
		} else {
			blockchainClient.isConnected.set(false);
			blockchainClient.userAddress.set(null);
		}
	});

	blockchainClient.onChainChanged(async (chainId) => {
		window.location.reload();
	});
}