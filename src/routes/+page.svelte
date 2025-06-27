<script>
  import { goto } from '$app/navigation';
  import { t } from '$lib/utils/i18n.js';

  $: features = [
    {
      icon: '⚡',
      title: $t('landing.features.advancedOrders.title'),
      description: $t('landing.features.advancedOrders.description')
    },
    {
      icon: '🔒',
      title: $t('landing.features.security.title'),
      description: $t('landing.features.security.description')
    },
    {
      icon: '💰',
      title: $t('landing.features.lowFees.title'),
      description: $t('landing.features.lowFees.description')
    },
    {
      icon: '📊',
      title: $t('landing.features.leveraged.title'),
      description: $t('landing.features.leveraged.description')
    },
    {
      icon: '🌊',
      title: $t('landing.features.amm.title'),
      description: $t('landing.features.amm.description')
    },
    {
      icon: '🎯',
      title: $t('landing.features.keeper.title'),
      description: $t('landing.features.keeper.description')
    }
  ];

  $: stats = [
    { label: $t('landing.stats.easyCode'), value: $t('landing.stats.easyCodeValue') },
    { label: $t('landing.stats.activePairs'), value: $t('landing.stats.activePairsValue') },
    { label: $t('landing.stats.maxLeverage'), value: $t('landing.stats.maxLeverageValue') },
    { label: $t('landing.stats.businessLogic'), value: $t('landing.stats.businessLogicValue') }
  ];

  $: tradingFeatures = [
    $t('landing.trading.features.limitOrders'),
    $t('landing.trading.features.stopLoss'),
    $t('landing.trading.features.marginTrading'),
    $t('landing.trading.features.circuitBreaker'),
    $t('landing.trading.features.flashLoanProtection'),
    $t('landing.trading.features.liquidationThreshold')
  ];

  $: defiFeatures = [
    $t('landing.defi.features.ammLiquidity'),
    $t('landing.defi.features.keeperRewards'),
    $t('landing.defi.features.governanceStaking'),
    $t('landing.defi.features.insuranceFund'),
    $t('landing.defi.features.crossChain'),
    $t('landing.defi.features.yieldFarming')
  ];

  function startTrading() {
    goto('/trade');
  }

  function exploreMarkets() {
    goto('/markets');
  }
</script>

<svelte:head>
  <title>{$t('landing.meta.title')}</title>
  <meta name="description" content={$t('landing.meta.description')} />
</svelte:head>

<!-- Hero Section -->
<section class="bg-gradient-to-br from-primary-50 to-blue-50 py-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
        {$t('landing.hero.titlePart1')}
        <span class="text-primary-600">{$t('landing.hero.titlePart2')}</span>
      </h1>
      <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        {$t('landing.hero.subtitle')}
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          on:click={startTrading}
          class="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          {$t('landing.hero.startTradingButton')}
        </button>
        <button
          on:click={exploreMarkets}
          class="bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition-colors"
        >
          {$t('landing.hero.exploreMarketsButton')}
        </button>
      </div>
    </div>
  </div>
</section>

<!-- Stats Section -->
<section class="py-16 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      {#each stats as stat}
        <div class="text-center">
          <div class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
          <div class="text-gray-600">{stat.label}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Features Section -->
<section class="py-20 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        {$t('landing.features.title')}
      </h2>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        {$t('landing.features.subtitle')}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each features as feature}
        <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div class="text-4xl mb-4">{feature.icon}</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
          <p class="text-gray-600">{feature.description}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Trading Section -->
<section class="py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          {$t('landing.trading.title')}
        </h2>
        <p class="text-lg text-gray-600 mb-6">
          {$t('landing.trading.description')}
        </p>
        <ul class="space-y-3 mb-8">
          {#each tradingFeatures as feature}
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span class="text-gray-700">{feature}</span>
            </li>
          {/each}
        </ul>
        <button
          on:click={startTrading}
          class="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          {$t('landing.trading.startTradingButton')}
        </button>
      </div>
      <div class="bg-gray-100 rounded-2xl p-8 text-center">
        <div class="text-6xl mb-4">📊</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">{$t('landing.trading.interface.title')}</h3>
        <p class="text-gray-600 mb-4">{$t('landing.trading.interface.description')}</p>
        <div class="bg-white rounded-lg p-4 shadow-sm space-y-3">
          <div class="flex justify-between">
            <span class="text-sm text-gray-500">ETH-PERP</span>
            <span class="text-sm font-medium text-green-600">+1.69%</span>
          </div>
          <div class="text-2xl font-bold text-gray-900">$2,497.31</div>
          <div class="grid grid-cols-2 gap-4 text-xs">
            <div class="bg-gray-50 rounded p-2">
              <div class="text-gray-500">{$t('landing.trading.interface.volume24h')}</div>
              <div class="font-medium">$45.4K</div>
            </div>
            <div class="bg-gray-50 rounded p-2">
              <div class="text-gray-500">{$t('landing.trading.interface.openInterest')}</div>
              <div class="font-medium">$2.1M</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- DeFi Section -->
<section class="py-20 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div class="bg-white rounded-2xl p-8 text-center order-2 lg:order-1">
        <div class="text-6xl mb-4">🏦</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">{$t('landing.defi.ecosystem.title')}</h3>
        <p class="text-gray-600 mb-4">{$t('landing.defi.ecosystem.description')}</p>
        <div class="space-y-3">
          <div class="bg-gray-50 rounded-lg p-3 flex justify-between">
            <span>{$t('landing.defi.ecosystem.swapFees')}</span>
            <span class="font-bold text-green-600">0.3%</span>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 flex justify-between">
            <span>{$t('landing.defi.ecosystem.keeperRewards')}</span>
            <span class="font-bold text-green-600">0.1%</span>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 flex justify-between">
            <span>{$t('landing.defi.ecosystem.lpRevenue')}</span>
            <span class="font-bold text-green-600">60%</span>
          </div>
        </div>
      </div>
      <div class="order-1 lg:order-2">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          {$t('landing.defi.title')}
        </h2>
        <p class="text-lg text-gray-600 mb-6">
          {$t('landing.defi.description')}
        </p>
        <ul class="space-y-3 mb-8">
          {#each defiFeatures as feature}
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span class="text-gray-700">{feature}</span>
            </li>
          {/each}
        </ul>
        <button
          on:click={() => goto('/earn')}
          class="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          {$t('landing.defi.exploreButton')}
        </button>
      </div>
    </div>
  </div>
</section>

<!-- Technology Section -->
<section class="py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        {$t('landing.technology.title')}
      </h2>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        {$t('landing.technology.subtitle')}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="text-center">
        <div class="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-3">{$t('landing.technology.security.title')}</h3>
        <p class="text-gray-600">{$t('landing.technology.security.description')}</p>
      </div>

      <div class="text-center">
        <div class="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-3">{$t('landing.technology.gasOptimized.title')}</h3>
        <p class="text-gray-600">{$t('landing.technology.gasOptimized.description')}</p>
      </div>

      <div class="text-center">
        <div class="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-3">{$t('landing.technology.keeperNetwork.title')}</h3>
        <p class="text-gray-600">{$t('landing.technology.keeperNetwork.description')}</p>
      </div>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="py-20 bg-primary-600">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
      {$t('landing.cta.title')}
    </h2>
    <p class="text-xl text-primary-100 mb-8">
      {$t('landing.cta.subtitle')}
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button
        on:click={startTrading}
        class="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
      >
        {$t('landing.cta.launchButton')}
      </button>
      <button
        on:click={() => goto('/help')}
        class="bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
      >
        {$t('landing.cta.documentationButton')}
      </button>
    </div>
  </div>
</section>