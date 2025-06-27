<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { DexAPI, isConnected, userAddress, SUPPORTED_TOKENS, blockchainClient } from '$lib/blockchain';
  import { goto } from '$app/navigation';
  import { t } from '$lib/utils/i18n.js';

  // Инициализация блокчейн-клиента, если это не было сделано ранее
  onMount(async () => {
    if (!blockchainClient.provider) {
      try {
        await DexAPI.init({
          rpcUrl: 'http://localhost:8545',
          chainId: 31337,
          autoConnect: false
        });
      } catch (err) {
        console.error('Ошибка инициализации блокчейн-клиента:', err);
        error.set($t('pools.errors.initializationFailed'));
      }
    }
  });

  const liquidityPools = writable([]);
  const isLoading = writable(true);
  const error = writable(null);
  const noPoolsAvailable = writable(false);

  async function fetchLiquidityPools() {
    try {
      isLoading.set(true);
      error.set(null);

      // Очищаем предыдущие данные и работаем только с реальными данными из блокчейна
      liquidityPools.set([]);

      // Проверяем инициализацию блокчейна
      if (!blockchainClient.provider) {
        console.error('Блокчейн-клиент не инициализирован');
        error.set($t('pools.errors.clientNotInitialized'));
        isLoading.set(false);
        return;
      }

      // Проверяем наличие контрактов
      if (!blockchainClient.contracts || !blockchainClient.contracts.router) {
        console.error('Router контракт не инициализирован');
        await blockchainClient.initializeContracts();

        if (!blockchainClient.contracts.router) {
          error.set($t('pools.errors.routerNotInitialized'));
          isLoading.set(false);
          return;
        }
      }

      // Для пулов ликвидности нам нужны комбинации пар токенов
      const pools = [];

      // Создаем все возможные пары из доступных токенов
      const tokens = Object.keys(SUPPORTED_TOKENS);
      const potentialPairs = [];

      // Создаем пары всех токенов
      for (let i = 0; i < tokens.length; i++) {
        for (let j = i + 1; j < tokens.length; j++) {
          potentialPairs.push({
            token0: tokens[i],
            token1: tokens[j]
          });
        }
      }

      for (const pair of potentialPairs) {
        try {
          // Получаем конфигурацию для каждого токена
          const token0Config = blockchainClient.getTokenConfig(pair.token0);
          const token1Config = blockchainClient.getTokenConfig(pair.token1);

          if (!token0Config || !token1Config) {
            console.log(`Конфигурация не найдена для токенов ${pair.token0} или ${pair.token1}`);
            continue;
          }

          // Получаем статистику из смарт-контракта для обоих токенов
          let stats0, stats1;
          try {
            stats0 = await blockchainClient.contracts.router.getLPStats(token0Config.address);
            stats1 = await blockchainClient.contracts.router.getLPStats(token1Config.address);
          } catch (statsError) {
            console.error(`Ошибка получения данных для пары ${pair.token0}/${pair.token1}:`, statsError);
            // Проверяем, является ли ошибка проблемой декодирования
            if (statsError.message && statsError.message.includes('could not decode result data')) {
              // Пропускаем эту пару, так как контракт не может её обработать
              continue;
            }
            throw statsError; // Пробрасываем другие ошибки для общей обработки
          }

          // Проверяем корректность данных
          if (!stats0 || !stats1 ||
              !stats0.totalContributions || !stats1.totalContributions) {
            console.error(`Некорректные данные для пары ${pair.token0}/${pair.token1}`);
            continue;
          }

          // Проверяем, есть ли ликвидность для этой пары
          if (stats0.totalContributions.toString() === '0' || stats1.totalContributions.toString() === '0') {
            continue;
          }

          // Форматируем показатели для отображения
          const tvl0 = parseFloat(blockchainClient.formatToken(stats0.totalContributions, token0Config.decimals));
          const tvl1 = parseFloat(blockchainClient.formatToken(stats1.totalContributions, token1Config.decimals));

          // Получаем цены токенов для расчета TVL в USD
          let price0 = 1, price1 = 1;
          try {
            price0 = parseFloat(blockchainClient.formatToken(
              await blockchainClient.contracts.oracle.getPrice(token0Config.address),
              18
            ));
            price1 = parseFloat(blockchainClient.formatToken(
              await blockchainClient.contracts.oracle.getPrice(token1Config.address),
              18
            ));
          } catch (priceErr) {
            console.warn(`Не удалось получить цены для токенов ${pair.token0}/${pair.token1}:`, priceErr);
          }

          const tvl0Usd = tvl0 * price0;
          const tvl1Usd = tvl1 * price1;
          const totalTVL = tvl0Usd + tvl1Usd;

          const formattedTVL = totalTVL > 1000000
            ? `$${(totalTVL / 1000000).toFixed(1)}M`
            : totalTVL > 1000
              ? `$${(totalTVL / 1000).toFixed(0)}K`
              : `$${totalTVL.toFixed(0)}`;

          // Рассчитываем объем торгов на основе комиссий
          const fees0 = parseFloat(blockchainClient.formatToken(stats0.totalFeesAccumulated, token0Config.decimals));
          const fees1 = parseFloat(blockchainClient.formatToken(stats1.totalFeesAccumulated, token1Config.decimals));

          // Приблизительный объем (комиссии / 0.003)
          const volume0 = fees0 / 0.003;
          const volume1 = fees1 / 0.003;

          const volume0Usd = volume0 * price0;
          const volume1Usd = volume1 * price1;
          const totalVolume = volume0Usd + volume1Usd;

          const formattedVolume = totalVolume > 1000000
            ? `$${(totalVolume / 1000000).toFixed(1)}M`
            : totalVolume > 1000
              ? `$${(totalVolume / 1000).toFixed(0)}K`
              : `$${totalVolume.toFixed(0)}`;

          // Общие комиссии в USD
          const fees0Usd = fees0 * price0;
          const fees1Usd = fees1 * price1;
          const totalFees = fees0Usd + fees1Usd;

          // Упрощенный расчет APY
          const apy = totalTVL > 0 ? ((totalFees / totalTVL) * 365 * 100).toFixed(1) : '0';

          pools.push({
            pair: `${pair.token0}/${pair.token1}`,
            apy: `${apy}%`,
            tvl: formattedTVL,
            volume24h: formattedVolume,
            token0: pair.token0,
            token1: pair.token1
          });
        } catch (err) {
          console.error(`Ошибка получения данных для пары ${pair.token0}/${pair.token1}:`, err);
          // Добавляем информативное сообщение в UI
          const errorMessage = typeof err === 'object' && err.message
            ? err.message
            : 'Неизвестная ошибка';

          if (errorMessage.includes('could not decode result data')) {
            error.set($t('pools.errors.contractDataFormat', { pair: `${pair.token0}/${pair.token1}` }));
          }
        }
      }

      // Устанавливаем только реальные данные из блокчейна
      liquidityPools.set(pools);

      // Проверяем, есть ли доступные пулы
      noPoolsAvailable.set(pools.length === 0);
    } catch (err) {
      console.error('Ошибка загрузки пулов ликвидности:', err);

      // Форматируем сообщение об ошибке для пользователя
      let errorMessage = $t('pools.errors.loadingFailed');

      if (err.message) {
        if (err.message.includes('could not decode result data')) {
          errorMessage = $t('pools.errors.contractDataFormatGeneral');
        } else {
          errorMessage += `: ${err.message}`;
        }
      }

      error.set(errorMessage);
      liquidityPools.set([]);
      noPoolsAvailable.set(true);
    } finally {
      isLoading.set(false);
    }
  }

  async function addLiquidity(pair) {
    try {
      if (!$isConnected) {
        await DexAPI.connectWallet();
        // После успешного подключения показываем сообщение
        if ($isConnected) {
          alert($t('pools.messages.liquidityComingSoon', { pair }));
        }
        return;
      }

      // Если кошелек уже подключен, просто показываем сообщение
      alert($t('pools.messages.liquidityComingSoon', { pair }));
    } catch (err) {
      console.error('Ошибка при подключении кошелька:', err);
      error.set($t('pools.errors.walletConnection'));
    }
  }

  onMount(() => {
    fetchLiquidityPools();
  });
</script>

<svelte:head>
  <title>{$t('pools.meta.title')}</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">{$t('pools.title')}</h1>
    <p class="text-gray-600">{$t('pools.description')}</p>
  </div>

  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div class="p-6 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900">{$t('pools.sections.availablePools')}</h2>
    </div>

    {#if $isLoading}
      <div class="py-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
        <p class="mt-2 text-gray-600">{$t('pools.loading.message')}</p>
      </div>
    {:else if $error}
      <div class="py-8 text-center">
        <p class="text-red-600">{$error}</p>
        <p class="mt-2 text-gray-600">{$t('pools.loading.realDataOnly')}</p>
        <div class="mt-4 flex justify-center space-x-4">
          <button
            class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            on:click={fetchLiquidityPools}
          >
            {$t('pools.buttons.refresh')}
          </button>
          <button
            class="px-4 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition-colors"
            on:click={() => DexAPI.connectWallet()}
          >
            {$t('pools.buttons.connectWallet')}
          </button>
        </div>

        {#if $error.includes('Router') || $error.includes('блокчейн') || $error.includes('blockchain')}
          <div class="mt-6 p-4 bg-gray-50 rounded-lg max-w-2xl mx-auto text-left">
            <h3 class="text-lg font-medium mb-2">{$t('pools.setup.title')}</h3>
            <ol class="list-decimal list-inside space-y-2 text-gray-700">
              <li>{$t('pools.setup.steps.install')}</li>
              <li>{$t('pools.setup.steps.compile')}</li>
              <li>{$t('pools.setup.steps.startNode')}</li>
              <li>{$t('pools.setup.steps.deploy')}</li>
              <li>{$t('pools.setup.steps.priceGenerator')}</li>
              <li>{$t('pools.setup.steps.unpause')}</li>
            </ol>
          </div>
        {/if}
      </div>
    {:else if $noPoolsAvailable}
      <div class="py-8 text-center">
        <p class="text-gray-600">{$t('pools.states.noPoolsCurrently')}</p>
        <div class="mt-4 flex justify-center space-x-4">
          <button
            class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            on:click={fetchLiquidityPools}
          >
            {$t('pools.buttons.refresh')}
          </button>
          <button
            class="px-4 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition-colors"
            on:click={() => goto('/swap')}
          >
            {$t('pools.buttons.goToSwap')}
          </button>
        </div>
      </div>
    {:else if $liquidityPools.length === 0}
      <div class="py-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">{$t('pools.states.noPoolsAvailable')}</h3>
        <p class="mt-1 text-sm text-gray-500">{$t('pools.states.noPoolsDescription')}</p>
        <div class="mt-6">
          <button
            class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            on:click={fetchLiquidityPools}
          >
            {$t('pools.buttons.refresh')}
          </button>
        </div>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{$t('pools.table.pair')}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{$t('pools.table.apy')}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{$t('pools.table.tvl')}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{$t('pools.table.volume24h')}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{$t('pools.table.action')}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            {#each $liquidityPools as pool}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pool.pair}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">{pool.apy}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pool.tvl}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pool.volume24h}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    class="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
                    on:click={() => addLiquidity(pool.pair)}
                  >
                    {$t('pools.buttons.addLiquidity')}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>