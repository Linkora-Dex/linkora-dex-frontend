import { blockchainClient } from './client.js';
import { TRADING_CONFIG } from './config.js';
import { ethers } from 'ethers';

class TradingManager {
	async createLimitOrder(tokenIn, tokenOut, amountIn, targetPrice, isLong = true) {
		try {
			const tokenInConfig = blockchainClient.getTokenConfig(tokenIn);
			const tokenOutConfig = blockchainClient.getTokenConfig(tokenOut);

			if (!tokenInConfig || !tokenOutConfig) {
				throw new Error('Invalid token configuration');
			}

			const amountInParsed = blockchainClient.parseToken(amountIn, tokenInConfig.decimals);
			const targetPriceParsed = blockchainClient.parseToken(targetPrice, 18);

			const expectedOut = await blockchainClient.contracts.router.getAmountOut(
				amountInParsed, tokenInConfig.address, tokenOutConfig.address
			);
			const minAmountOut = expectedOut.mul(95).div(100);

			const txOptions = {};
			if (tokenInConfig.address === ethers.constants.AddressZero) {
				txOptions.value = amountInParsed;
			}

			const tx = await blockchainClient.contracts.router.createLimitOrder(
				tokenInConfig.address,
				tokenOutConfig.address,
				amountInParsed,
				targetPriceParsed,
				minAmountOut,
				isLong,
				txOptions
			);

			return await blockchainClient.waitForTransaction(tx);
		} catch (error) {
			console.error('❌ Failed to create limit order:', error);
			throw error;
		}
	}

	async createStopLossOrder(tokenIn, tokenOut, amountIn, stopPrice) {
		try {
			const tokenInConfig = blockchainClient.getTokenConfig(tokenIn);
			const tokenOutConfig = blockchainClient.getTokenConfig(tokenOut);

			if (!tokenInConfig || !tokenOutConfig) {
				throw new Error('Invalid token configuration');
			}

			const amountInParsed = blockchainClient.parseToken(amountIn, tokenInConfig.decimals);
			const stopPriceParsed = blockchainClient.parseToken(stopPrice, 18);

			const expectedOut = await blockchainClient.contracts.router.getAmountOut(
				amountInParsed, tokenInConfig.address, tokenOutConfig.address
			);
			const minAmountOut = expectedOut.mul(95).div(100);

			const txOptions = {};
			if (tokenInConfig.address === ethers.constants.AddressZero) {
				txOptions.value = amountInParsed;
			}

			const tx = await blockchainClient.contracts.router.createStopLossOrder(
				tokenInConfig.address,
				tokenOutConfig.address,
				amountInParsed,
				stopPriceParsed,
				minAmountOut,
				txOptions
			);

			return await blockchainClient.waitForTransaction(tx);
		} catch (error) {
			console.error('❌ Failed to create stop loss order:', error);
			throw error;
		}
	}

	async swapTokens(tokenIn, tokenOut, amountIn, slippagePercent = TRADING_CONFIG.DEFAULT_SLIPPAGE) {
		try {
			const tokenInConfig = blockchainClient.getTokenConfig(tokenIn);
			const tokenOutConfig = blockchainClient.getTokenConfig(tokenOut);

			if (!tokenInConfig || !tokenOutConfig) {
				throw new Error('Invalid token configuration');
			}

			const amountInParsed = blockchainClient.parseToken(amountIn, tokenInConfig.decimals);

			const expectedOut = await blockchainClient.contracts.router.getAmountOut(
				amountInParsed, tokenInConfig.address, tokenOutConfig.address
			);

			const minAmountOut = expectedOut.mul(Math.floor((100 - slippagePercent) * 100)).div(10000);

			const txOptions = {};
			if (tokenInConfig.address === ethers.constants.AddressZero) {
				txOptions.value = amountInParsed;
			}

			const tx = await blockchainClient.contracts.router.swapTokens(
				tokenInConfig.address,
				tokenOutConfig.address,
				amountInParsed,
				minAmountOut,
				txOptions
			);

			return await blockchainClient.waitForTransaction(tx);
		} catch (error) {
			console.error('❌ Failed to swap tokens:', error);
			throw error;
		}
	}

	async openPosition(token, collateralAmount, leverage, isLong) {
		try {
			if (leverage < TRADING_CONFIG.MIN_LEVERAGE || leverage > TRADING_CONFIG.MAX_LEVERAGE) {
				throw new Error(`Leverage must be between ${TRADING_CONFIG.MIN_LEVERAGE}x and ${TRADING_CONFIG.MAX_LEVERAGE}x`);
			}

			const tokenConfig = blockchainClient.getTokenConfig(token);
			if (!tokenConfig) {
				throw new Error('Invalid token configuration');
			}

			const collateralParsed = blockchainClient.parseToken(collateralAmount, 18);

			const tx = await blockchainClient.contracts.router.openPosition(
				tokenConfig.address,
				collateralParsed,
				leverage,
				isLong,
				{ value: collateralParsed }
			);

			return await blockchainClient.waitForTransaction(tx);
		} catch (error) {
			console.error('❌ Failed to open position:', error);
			throw error;
		}
	}

	async closePosition(positionId) {
		try {
			const tx = await blockchainClient.contracts.router.closePosition(positionId);
			return await blockchainClient.waitForTransaction(tx);
		} catch (error) {
			console.error('❌ Failed to close position:', error);
			throw error;
		}
	}

	async cancelOrder(orderId) {
		try {
			const tx = await blockchainClient.contracts.router.cancelOrder(orderId);
			return await blockchainClient.waitForTransaction(tx);
		} catch (error) {
			console.error('❌ Failed to cancel order:', error);
			throw error;
		}
	}

	async selfExecuteOrder(orderId) {
		try {
			const tx = await blockchainClient.contracts.router.selfExecuteOrder(orderId);
			return await blockchainClient.waitForTransaction(tx);
		} catch (error) {
			console.error('❌ Failed to self execute order:', error);
			throw error;
		}
	}

	async getQuote(tokenIn, tokenOut, amountIn) {
		try {
			const tokenInConfig = blockchainClient.getTokenConfig(tokenIn);
			const tokenOutConfig = blockchainClient.getTokenConfig(tokenOut);

			if (!tokenInConfig || !tokenOutConfig) {
				throw new Error('Invalid token configuration');
			}

			const amountInParsed = blockchainClient.parseToken(amountIn, tokenInConfig.decimals);
			const amountOut = await blockchainClient.contracts.router.getAmountOut(
				amountInParsed, tokenInConfig.address, tokenOutConfig.address
			);

			const amountOutFormatted = blockchainClient.formatToken(amountOut, tokenOutConfig.decimals);
			const priceImpact = this.calculatePriceImpact(amountIn, amountOutFormatted, tokenIn, tokenOut);

			return {
				amountIn: parseFloat(amountIn),
				amountOut: parseFloat(amountOutFormatted),
				priceImpact: priceImpact,
				fee: parseFloat(amountIn) * TRADING_CONFIG.SWAP_FEE / 100,
				route: [tokenInConfig.symbol, tokenOutConfig.symbol]
			};
		} catch (error) {
			console.error('❌ Failed to get quote:', error);
			throw error;
		}
	}

	calculatePriceImpact(amountIn, amountOut, tokenIn, tokenOut) {
		try {
			const rate = parseFloat(amountOut) / parseFloat(amountIn);
			const marketRate = 1;
			return Math.abs((rate - marketRate) / marketRate) * 100;
		} catch (error) {
			return 0;
		}
	}

	async getPositionDetails(positionId) {
		try {
			const position = await blockchainClient.contracts.router.getPosition(positionId);
			const currentPrice = await blockchainClient.contracts.router.getPrice(position.token);
			const tokenConfig = blockchainClient.getTokenConfig(position.token);

			const entryPrice = parseFloat(blockchainClient.formatToken(position.entryPrice, 18));
			const currentPriceFormatted = parseFloat(blockchainClient.formatToken(currentPrice, 18));
			const size = parseFloat(blockchainClient.formatToken(position.size, 18));
			const collateral = parseFloat(blockchainClient.formatToken(position.collateralAmount, 18));

			const isLong = position.positionType === 0;
			let pnlPercent = 0;

			if (isLong) {
				pnlPercent = ((currentPriceFormatted - entryPrice) / entryPrice) * 100;
			} else {
				pnlPercent = ((entryPrice - currentPriceFormatted) / entryPrice) * 100;
			}

			const pnlUSD = (pnlPercent / 100) * size;
			const liquidationPrice = this.calculateLiquidationPrice(entryPrice, position.leverage.toNumber(), isLong);
			const marginLevel = ((collateral + pnlUSD) / size) * 100;

			return {
				id: positionId.toString(),
				token: tokenConfig?.symbol || 'UNKNOWN',
				size: size,
				collateral: collateral,
				leverage: position.leverage.toString(),
				entryPrice: entryPrice,
				currentPrice: currentPriceFormatted,
				liquidationPrice: liquidationPrice,
				pnlPercent: pnlPercent,
				pnlUSD: pnlUSD,
				marginLevel: marginLevel,
				isLong: isLong,
				status: this.getPositionStatus(pnlPercent, marginLevel),
				timeToLiquidation: this.calculateTimeToLiquidation(currentPriceFormatted, liquidationPrice)
			};
		} catch (error) {
			console.error('❌ Failed to get position details:', error);
			throw error;
		}
	}

	calculateLiquidationPrice(entryPrice, leverage, isLong) {
		const liquidationThreshold = TRADING_CONFIG.LIQUIDATION_THRESHOLD;

		if (isLong) {
			return entryPrice * (1 - liquidationThreshold / (100 * leverage));
		} else {
			return entryPrice * (1 + liquidationThreshold / (100 * leverage));
		}
	}

	getPositionStatus(pnlPercent, marginLevel) {
		if (pnlPercent <= -TRADING_CONFIG.LIQUIDATION_THRESHOLD) {
			return 'liquidatable';
		} else if (marginLevel <= 110) {
			return 'danger';
		} else if (marginLevel <= 150) {
			return 'warning';
		} else {
			return 'healthy';
		}
	}

	calculateTimeToLiquidation(currentPrice, liquidationPrice) {
		const distance = Math.abs(currentPrice - liquidationPrice) / currentPrice;
		if (distance < 0.01) return 'immediate';
		if (distance < 0.05) return 'hours';
		if (distance < 0.1) return 'days';
		return 'weeks';
	}

	async validateOrder(tokenIn, tokenOut, amountIn, orderType = 'market') {
		try {
			const tokenInConfig = blockchainClient.getTokenConfig(tokenIn);
			const tokenOutConfig = blockchainClient.getTokenConfig(tokenOut);

			if (!tokenInConfig || !tokenOutConfig) {
				return { valid: false, error: 'Invalid token pair' };
			}

			const userAddress = await new Promise(resolve => {
				blockchainClient.userAddress.subscribe(value => resolve(value))();
			});

			if (!userAddress) {
				return { valid: false, error: 'Wallet not connected' };
			}

			const balance = await blockchainClient.contracts.router.getAvailableBalance(
				userAddress, tokenInConfig.address
			);

			const amountInParsed = blockchainClient.parseToken(amountIn, tokenInConfig.decimals);

			if (balance.lt(amountInParsed)) {
				return { valid: false, error: 'Insufficient balance' };
			}

			const quote = await this.getQuote(tokenIn, tokenOut, amountIn);

			if (quote.priceImpact > 10) {
				return { valid: false, error: 'Price impact too high' };
			}

			return {
				valid: true,
				quote: quote,
				estimatedGas: '150000'
			};
		} catch (error) {
			return { valid: false, error: error.message };
		}
	}
}

export const tradingManager = new TradingManager();