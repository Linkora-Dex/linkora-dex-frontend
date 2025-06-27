<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { SUPPORTED_TOKENS } from '$lib/blockchain/config.js';
  import { onMount } from 'svelte';
  import { apiClient } from '$lib/utils/api.js';
  import { t } from '$lib/utils/i18n.js';

  let searchQuery = '';
  let activeFilter = $page.url.searchParams.get('filter') || 'all';
  let isLoading = true;
  let markets = [];

  $: filters = [
    { id: 'favorites', name: $t('markets.filters.favorites'), icon: '⭐' },
    { id: 'perpetual', name: $t('markets.filters.perpetual'), icon: '♾️' },
    { id: 'spot', name: $t('markets.filters.spot'), icon: '💱' },
    { id: 'all', name: $t('markets.filters.all'), icon: '📊' }
  ];

  // Функция для создания рыночных данных на основе списка токенов
  function generateMarketsFromTokens() {
    const generatedMarkets = [];

    // Создаем PERP рынки для каждого токена
    Object.keys(SUPPORTED_TOKENS).forEach(tokenSymbol => {
      if (tokenSymbol === 'ETH') {
        // ETH-PERP с положительным изменением
        generatedMarkets.push({
          pair: 'ETH-PERP',
          baseToken: 'ETH',
          price: '2,497.31',
          change: '+1.69%',
          changeClass: 'text-green-600',
          volume: '$45,457.34',
          high: '2,539.60',
          low: '2,496.80',
          funding: '0.0238%',
          openInterest: '$30,914.94'
        });
      } else {
        // Генерируем случайные данные для других токенов
        const price = (Math.random() * (tokenSymbol === 'CAPY' ? 10 : 5)).toFixed(2);
        const changePercent = (Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1)).toFixed(2);
        const changeSign = changePercent > 0 ? '+' : '';
        const high = (parseFloat(price) * (1 + Math.random() * 0.03)).toFixed(2);
        const low = (parseFloat(price) * (1 - Math.random() * 0.02)).toFixed(2);
        const volume = (Math.random() * 1000000).toFixed(2);
        const funding = (Math.random() * 0.05 * (Math.random() > 0.6 ? 1 : -1)).toFixed(4);
        const openInterest = (Math.random() * 50000).toFixed(2);

        generatedMarkets.push({
          pair: `${tokenSymbol}-PERP`,
          baseToken: tokenSymbol,
          price,
          change: `${changeSign}${changePercent}%`,
          changeClass: parseFloat(changePercent) >= 0 ? 'text-green-600' : 'text-red-600',
          volume: `$${(parseFloat(volume)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
          high,
          low,
          funding: `${funding}%`,
          openInterest: `$${(parseFloat(openInterest)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
        });
      }

      // Если это не ETH, создаем также спотовый рынок ETH/TokenSymbol
      if (tokenSymbol !== 'ETH') {
        const spotPrice = (Math.random() * (tokenSymbol === 'CAPY' ? 0.005 : 0.001)).toFixed(6);
        const spotChangePercent = (Math.random() * 3 * (Math.random() > 0.5 ? 1 : -1)).toFixed(2);
        const spotChangeSign = spotChangePercent > 0 ? '+' : '';
        const spotHigh = (parseFloat(spotPrice) * (1 + Math.random() * 0.02)).toFixed(6);
        const spotLow = (parseFloat(spotPrice) * (1 - Math.random() * 0.01)).toFixed(6);
        const spotVolume = (Math.random() * 500000).toFixed(2);

        generatedMarkets.push({
          pair: `ETH-${tokenSymbol}`,
          baseToken: 'ETH',
          quoteToken: tokenSymbol,
          price: spotPrice,
          change: `${spotChangeSign}${spotChangePercent}%`,
          changeClass: parseFloat(spotChangePercent) >= 0 ? 'text-green-600' : 'text-red-600',
          volume: `$${(parseFloat(spotVolume)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
          high: spotHigh,
          low: spotLow,
          funding: '—', // Спотовые рынки не имеют ставки финансирования
          openInterest: '—' // Спотовые рынки не имеют открытого интереса
        });
      }
    });

    return generatedMarkets;
  }

  // Загрузка данных
  async function loadMarkets() {
    isLoading = true;
    try {
      // В реальном приложении здесь был бы API-запрос
      // const marketData = await apiClient.getMarkets();
      markets = generateMarketsFromTokens();
    } catch (error) {
      console.error('Ошибка при загрузке рынков:', error);
      markets = generateMarketsFromTokens();
    } finally {
      isLoading = false;
    }
  }

  function setFilter(filterId) {
    activeFilter = filterId;
    const url = new URL($page.url);
    if (filterId === 'all') {
      url.searchParams.delete('filter');
    } else {
      url.searchParams.set('filter', filterId);
    }
    goto(url.toString(), { replaceState: true });
  }

  function tradePair(pair) {
    goto(`/trade/${pair}`);
  }

  function toggleFavorite(pair) {
    // В реальном приложении здесь был бы код для сохранения избранного
    console.log(`Добавление/удаление из избранного: ${pair}`);
  }

  $: filteredMarkets = markets.filter(market => {
    const matchesSearch = market.pair.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' ||
      (activeFilter === 'perpetual' && market.pair.includes('PERP')) ||
      (activeFilter === 'spot' && !market.pair.includes('PERP')) ||
      (activeFilter === 'favorites' && /* Здесь логика избранных */ true);
    return matchesSearch && matchesFilter;
  });

  onMount(() => {
    loadMarkets();
  });
</script>

<svelte:head>
  <title>{$t('markets.meta.title')}</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">{$t('markets.title')}</h1>
    <p class="text-gray-600">{$t('markets.description')}</p>
  </div>

  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div class="p-6 border-b border-gray-200">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div class="flex flex-wrap gap-2">
          {#each filters as filter}
            <button
              class="px-4 py-2 rounded-md text-sm font-medium transition-colors
                {activeFilter === filter.id
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
              on:click={() => setFilter(filter.id)}
            >
              <span class="mr-2">{filter.icon}</span>
              {filter.name}
            </button>
          {/each}
        </div>

        <div class="w-full sm:w-auto">
          <input
            type="text"
            placeholder={$t('markets.search.placeholder')}
            bind:value={searchQuery}
            class="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    {#if isLoading}
      <div class="py-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
        <p class="mt-2 text-gray-600">{$t('markets.loading.message')}</p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {$t('markets.table.marketVolume')}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {$t('markets.table.price')}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {$t('markets.table.change24h')}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {$t('markets.table.highLow24h')}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {$t('markets.table.fundingRate')}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {$t('markets.table.openInterest')}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {$t('markets.table.action')}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each filteredMarkets as market}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <button class="mr-2 text-gray-400 hover:text-yellow-500 focus:outline-none" on:click={() => toggleFavorite(market.pair)}>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{market.pair}</div>
                      <div class="text-sm text-gray-500">{market.volume}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{market.price}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-medium {market.changeClass}">{market.change}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{market.high}</div>
                  <div class="text-gray-500">{market.low}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm {market.funding.startsWith('-') ? 'text-red-600' : (market.funding === '—' ? 'text-gray-500' : 'text-green-600')}">
                    {market.funding}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {market.openInterest}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button
                    on:click={() => tradePair(market.pair)}
                    class="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    {$t('markets.buttons.trade')}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if filteredMarkets.length === 0}
        <div class="text-center py-12">
          <div class="text-gray-500 mb-2">{$t('markets.noResults.title')}</div>
          <div class="text-sm text-gray-400">{$t('markets.noResults.description')}</div>
        </div>
      {/if}
    {/if}
  </div>
</div>