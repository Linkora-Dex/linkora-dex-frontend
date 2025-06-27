import { blockchainClient } from './client.js';
import { ethers } from 'ethers';

class DeFiManager {
  // ========== Lending функции ==========

  /**
   * Депозит в пул кредитования
   * @param {string} tokenSymbol - Символ токена
   * @param {string} amount - Сумма депозита
   * @returns {Promise<ethers.TransactionReceipt>} - Результат транзакции
   */
  async lendToken(tokenSymbol, amount) {
    try {
      const tokenConfig = blockchainClient.getTokenConfig(tokenSymbol);
      if (!tokenConfig) {
        throw new Error('Неверная конфигурация токена');
      }

      const amountParsed = blockchainClient.parseToken(amount, tokenConfig.decimals);

      // Предположим, что у Router есть метод lendToken
      // В реальном контракте будут свои методы для lending
      const tx = await blockchainClient.contracts.router.depositToken(
        tokenConfig.address,
        amountParsed
      );

      return await blockchainClient.waitForTransaction(tx);
    } catch (error) {
      console.error('❌ Ошибка депозита в пул кредитования:', error);
      throw error;
    }
  }

  /**
   * Вывод из пула кредитования
   * @param {string} tokenSymbol - Символ токена
   * @param {string} amount - Сумма вывода
   * @returns {Promise<ethers.TransactionReceipt>} - Результат транзакции
   */
  async withdrawFromLending(tokenSymbol, amount) {
    try {
      const tokenConfig = blockchainClient.getTokenConfig(tokenSymbol);
      if (!tokenConfig) {
        throw new Error('Неверная конфигурация токена');
      }

      const amountParsed = blockchainClient.parseToken(amount, tokenConfig.decimals);

      // Предположим, что у Router есть метод withdrawFromLending
      // В реальном контракте будут свои методы для вывода из lending
      const tx = await blockchainClient.contracts.router.withdrawToken(
        tokenConfig.address,
        amountParsed
      );

      return await blockchainClient.waitForTransaction(tx);
    } catch (error) {
      console.error('❌ Ошибка вывода из пула кредитования:', error);
      throw error;
    }
  }

  /**
   * Получение баланса пользователя в пуле кредитования
   * @param {string} tokenSymbol - Символ токена
   * @returns {Promise<string>} - Баланс в виде строки
   */
  async getLendingBalance(tokenSymbol) {
    try {
      const userAddress = await new Promise(resolve => {
        blockchainClient.userAddress.subscribe(value => resolve(value))();
      });

      if (!userAddress) {
        return '0';
      }

      const tokenConfig = blockchainClient.getTokenConfig(tokenSymbol);
      if (!tokenConfig) {
        throw new Error('Неверная конфигурация токена');
      }

      // Получаем баланс пользователя в пуле
      const balance = await blockchainClient.contracts.router.getBalance(
        userAddress,
        tokenConfig.address
      );

      return blockchainClient.formatToken(balance, tokenConfig.decimals);
    } catch (error) {
      console.error('❌ Ошибка получения баланса в пуле кредитования:', error);
      return '0';
    }
  }

  /**
   * Получение информации о пуле кредитования
   * @param {string} tokenSymbol - Символ токена
   * @returns {Promise<Object>} - Информация о пуле
   */
  async getLendingPoolInfo(tokenSymbol) {
    try {
      const tokenConfig = blockchainClient.getTokenConfig(tokenSymbol);
      if (!tokenConfig) {
        throw new Error('Неверная конфигурация токена');
      }

      // Получаем статистику пула
      const stats = await blockchainClient.contracts.router.getLPStats(tokenConfig.address);

      // Форматируем данные для отображения
      const totalSupplied = blockchainClient.formatToken(stats.totalContributions, tokenConfig.decimals);
      const accumulatedFees = blockchainClient.formatToken(stats.totalFeesAccumulated, tokenConfig.decimals);
      const availableFees = blockchainClient.formatToken(stats.availableFees, tokenConfig.decimals);

      // Рассчитываем APY на основе накопленных комиссий
      const apyBase = parseFloat(totalSupplied) > 0 
        ? (parseFloat(accumulatedFees) / parseFloat(totalSupplied)) * 100 
        : 0;

      // Годовая доходность (упрощенный расчет)
      const apy = (apyBase * 365).toFixed(2);

      // Расчет использования пула
      const utilization = parseFloat(totalSupplied) > 0 
        ? Math.min(100, Math.round(((parseFloat(totalSupplied) - parseFloat(availableFees)) / parseFloat(totalSupplied)) * 100)) 
        : 0;

      return {
        token: tokenSymbol,
        totalSupplied,
        apy: `${apy}%`,
        utilization: `${utilization}%`,
        availableFees
      };
    } catch (error) {
      console.error('❌ Ошибка получения информации о пуле кредитования:', error);
      throw error;
    }
  }

  // ========== Liquidity Pool функции ==========

  /**
   * Добавление ликвидности в пул
   * @param {string} token0Symbol - Символ первого токена
   * @param {string} token1Symbol - Символ второго токена
   * @param {string} amount0 - Сумма первого токена
   * @param {string} amount1 - Сумма второго токена
   * @returns {Promise<ethers.TransactionReceipt>} - Результат транзакции
   */
  async addLiquidity(token0Symbol, token1Symbol, amount0, amount1) {
    try {
      const token0Config = blockchainClient.getTokenConfig(token0Symbol);
      const token1Config = blockchainClient.getTokenConfig(token1Symbol);

      if (!token0Config || !token1Config) {
        throw new Error('Неверная конфигурация токенов');
      }

      const amount0Parsed = blockchainClient.parseToken(amount0, token0Config.decimals);
      const amount1Parsed = blockchainClient.parseToken(amount1, token1Config.decimals);

      // В реальном контракте будет специальный метод для добавления ликвидности
      // Здесь мы используем depositToken как пример
      const tx0 = await blockchainClient.contracts.router.depositToken(
        token0Config.address,
        amount0Parsed
      );

      await blockchainClient.waitForTransaction(tx0);

      const tx1 = await blockchainClient.contracts.router.depositToken(
        token1Config.address,
        amount1Parsed
      );

      return await blockchainClient.waitForTransaction(tx1);
    } catch (error) {
      console.error('❌ Ошибка добавления ликвидности:', error);
      throw error;
    }
  }

  /**
   * Удаление ликвидности из пула
   * @param {string} token0Symbol - Символ первого токена
   * @param {string} token1Symbol - Символ второго токена
   * @param {string} lpAmount - Сумма LP токенов для вывода
   * @returns {Promise<ethers.TransactionReceipt>} - Результат транзакции
   */
  async removeLiquidity(token0Symbol, token1Symbol, lpAmount) {
    try {
      const token0Config = blockchainClient.getTokenConfig(token0Symbol);
      const token1Config = blockchainClient.getTokenConfig(token1Symbol);

      if (!token0Config || !token1Config) {
        throw new Error('Неверная конфигурация токенов');
      }

      // В реальном контракте будет специальный метод для удаления ликвидности
      // Здесь мы используем withdrawToken как пример
      const tx = await blockchainClient.contracts.router.withdrawToken(
        token0Config.address,
        blockchainClient.parseToken(lpAmount, 18) // LP токены обычно имеют 18 десятичных знаков
      );

      return await blockchainClient.waitForTransaction(tx);
    } catch (error) {
      console.error('❌ Ошибка удаления ликвидности:', error);
      throw error;
    }
  }

  /**
   * Получение информации о пуле ликвидности
   * @param {string} token0Symbol - Символ первого токена
   * @param {string} token1Symbol - Символ второго токена
   * @returns {Promise<Object>} - Информация о пуле ликвидности
   */
  async getLiquidityPoolInfo(token0Symbol, token1Symbol) {
    try {
      const token0Config = blockchainClient.getTokenConfig(token0Symbol);
      const token1Config = blockchainClient.getTokenConfig(token1Symbol);

      if (!token0Config || !token1Config) {
        throw new Error('Неверная конфигурация токенов');
      }

      // Получаем статистику для обоих токенов
      const stats0 = await blockchainClient.contracts.router.getLPStats(token0Config.address);
      const stats1 = await blockchainClient.contracts.router.getLPStats(token1Config.address);

      // Форматируем данные
      const tvl0 = parseFloat(blockchainClient.formatToken(stats0.totalContributions, token0Config.decimals));
      const tvl1 = parseFloat(blockchainClient.formatToken(stats1.totalContributions, token1Config.decimals));

      // Получаем цены токенов для конвертации в USD
      const price0 = parseFloat(blockchainClient.formatToken(
        await blockchainClient.contracts.router.getPrice(token0Config.address),
        18 // Цены обычно хранятся с 18 десятичными знаками
      ));

      const price1 = parseFloat(blockchainClient.formatToken(
        await blockchainClient.contracts.router.getPrice(token1Config.address),
        18
      ));

      // Рассчитываем общую стоимость в USD
      const tvlUsd = (tvl0 * price0) + (tvl1 * price1);

      // Рассчитываем объем торгов на основе комиссий
      const fees0 = parseFloat(blockchainClient.formatToken(stats0.totalFeesAccumulated, token0Config.decimals));
      const fees1 = parseFloat(blockchainClient.formatToken(stats1.totalFeesAccumulated, token1Config.decimals));

      // Приблизительный объем торгов (комиссии / ставка комиссии)
      const volume0 = fees0 / 0.003; // Предполагаем ставку комиссии 0.3%
      const volume1 = fees1 / 0.003;
      const volumeUsd = (volume0 * price0) + (volume1 * price1);

      // Расчет APY
      const feesUsd = (fees0 * price0) + (fees1 * price1);
      const apy = tvlUsd > 0 ? ((feesUsd / tvlUsd) * 365 * 100).toFixed(1) : '0';

      return {
        pair: `${token0Symbol}/${token1Symbol}`,
        tvl: tvlUsd.toFixed(2),
        volume24h: volumeUsd.toFixed(2),
        apy: `${apy}%`,
        token0: {
          symbol: token0Symbol,
          balance: tvl0.toString(),
          price: price0.toString()
        },
        token1: {
          symbol: token1Symbol,
          balance: tvl1.toString(),
          price: price1.toString()
        }
      };
    } catch (error) {
      console.error('❌ Ошибка получения информации о пуле ликвидности:', error);
      throw error;
    }
  }

  /**
   * Получение вклада пользователя в пул ликвидности
   * @param {string} token0Symbol - Символ первого токена
   * @param {string} token1Symbol - Символ второго токена
   * @returns {Promise<Object>} - Информация о вкладе пользователя
   */
  async getUserLPContribution(token0Symbol, token1Symbol) {
    try {
      const userAddress = await new Promise(resolve => {
        blockchainClient.userAddress.subscribe(value => resolve(value))();
      });

      if (!userAddress) {
        return null;
      }

      const token0Config = blockchainClient.getTokenConfig(token0Symbol);
      const token1Config = blockchainClient.getTokenConfig(token1Symbol);

      if (!token0Config || !token1Config) {
        throw new Error('Неверная конфигурация токенов');
      }

      // Получаем информацию о вкладе пользователя
      const userInfo0 = await blockchainClient.contracts.router.getUserLPInfo(
        userAddress,
        token0Config.address
      );

      const userInfo1 = await blockchainClient.contracts.router.getUserLPInfo(
        userAddress,
        token1Config.address
      );

      // Форматируем данные
      return {
        token0: {
          contribution: blockchainClient.formatToken(userInfo0.contribution, token0Config.decimals),
          sharePercentage: parseFloat(blockchainClient.formatToken(userInfo0.sharePercentage, 4)), // 4 десятичных знака для процентов
          claimableFees: blockchainClient.formatToken(userInfo0.claimableFees, token0Config.decimals),
          totalClaimed: blockchainClient.formatToken(userInfo0.totalClaimed, token0Config.decimals)
        },
        token1: {
          contribution: blockchainClient.formatToken(userInfo1.contribution, token1Config.decimals),
          sharePercentage: parseFloat(blockchainClient.formatToken(userInfo1.sharePercentage, 4)),
          claimableFees: blockchainClient.formatToken(userInfo1.claimableFees, token1Config.decimals),
          totalClaimed: blockchainClient.formatToken(userInfo1.totalClaimed, token1Config.decimals)
        }
      };
    } catch (error) {
      console.error('❌ Ошибка получения вклада пользователя в пул ликвидности:', error);
      return null;
    }
  }

  /**
   * Получение доступных для пользователя комиссий
   * @param {string} tokenSymbol - Символ токена
   * @returns {Promise<string>} - Сумма доступных комиссий
   */
  async getClaimableFees(tokenSymbol) {
    try {
      const userAddress = await new Promise(resolve => {
        blockchainClient.userAddress.subscribe(value => resolve(value))();
      });

      if (!userAddress) {
        return '0';
      }

      const tokenConfig = blockchainClient.getTokenConfig(tokenSymbol);
      if (!tokenConfig) {
        throw new Error('Неверная конфигурация токена');
      }

      const claimableFees = await blockchainClient.contracts.router.getClaimableLPFees(
        userAddress,
        tokenConfig.address
      );

      return blockchainClient.formatToken(claimableFees, tokenConfig.decimals);
    } catch (error) {
      console.error('❌ Ошибка получения доступных комиссий:', error);
      return '0';
    }
  }

  /**
   * Получение комиссий
   * @param {string} tokenSymbol - Символ токена
   * @returns {Promise<ethers.TransactionReceipt>} - Результат транзакции
   */
  async claimFees(tokenSymbol) {
    try {
      const tokenConfig = blockchainClient.getTokenConfig(tokenSymbol);
      if (!tokenConfig) {
        throw new Error('Неверная конфигурация токена');
      }

      const tx = await blockchainClient.contracts.router.claimLPFees(tokenConfig.address);
      return await blockchainClient.waitForTransaction(tx);
    } catch (error) {
      console.error('❌ Ошибка получения комиссий:', error);
      throw error;
    }
  }
}

export const defiManager = new DeFiManager();
