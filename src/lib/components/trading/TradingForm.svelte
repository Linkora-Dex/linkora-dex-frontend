<script>
  export let pair = 'ETH-PERP';

  import { walletStore } from '$lib/stores/wallet.js';
  import { t } from '$lib/utils/i18n.js';

  let isConnected = false;
  walletStore.subscribe(state => {
    isConnected = state.isConnected;
  });

  let activeTab = 'spot'; // spot, margin, futures
  let orderType = 'limit';
  let positionType = 'buy';
  let amount = '';
  let price = '';
  let stopPrice = '';
  let leverage = 1;
  let marginMode = 'cross'; // cross, isolated

  $: tabs = [
    { id: 'spot', name: $t('tradingForm.tabs.spot') },
    { id: 'margin', name: $t('tradingForm.tabs.margin') },
    { id: 'futures', name: $t('tradingForm.tabs.futures') }
  ];

  $: orderTypes = [
    { id: 'limit', name: $t('tradingForm.orderTypes.limit') },
    { id: 'market', name: $t('tradingForm.orderTypes.market') },
    { id: 'stop', name: $t('tradingForm.orderTypes.stopLimit') },
    { id: 'oco', name: $t('tradingForm.orderTypes.oco') }
  ];

  // Фильтруем типы ордеров в зависимости от активного таба
  $: availableOrderTypes = activeTab === 'spot'
    ? orderTypes.filter(type => type.id !== 'oco') // Убираем OCO для спота
    : orderTypes;

  // Сбрасываем параметры при смене таба
  $: {
    if (activeTab === 'spot') {
      leverage = 1;
      marginMode = 'cross';
      if (orderType === 'oco') {
        orderType = 'limit';
      }
    }
  }

  const leverageOptions = [1, 2, 3, 5, 10, 20, 50, 100];

  function handleTrade() {
    if (!isConnected) {
      walletStore.connect();
      return;
    }
    console.log('Trading:', {
      pair,
      activeTab,
      orderType,
      positionType,
      amount,
      price,
      stopPrice,
      leverage,
      marginMode
    });
  }

  function connectWallet() {
    walletStore.connect();
  }

  function setPercentage(percentage) {
    // Simulate setting amount based on percentage of available balance
    const mockBalance = 1000;
    amount = (mockBalance * percentage / 100).toString();
  }

  $: canTrade = isConnected && amount && parseFloat(amount) > 0 &&
    (orderType === 'market' || (price && parseFloat(price) > 0));
</script>

<div class="h-full flex flex-col bg-white">
  <!-- Tabs -->
  <div class="border-b">
    <div class="flex">
      {#each tabs as tab}
        <button
          class="flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors
            {activeTab === tab.id
              ? 'border-primary-500 text-primary-600 bg-primary-50'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
          on:click={() => activeTab = tab.id}
        >
          {tab.name}
        </button>
      {/each}
    </div>
  </div>

  <div class="flex-1 p-4 space-y-4 overflow-y-auto">
    <!-- Order Type -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">{$t('tradingForm.labels.orderType')}</label>
      <div class="grid grid-cols-2 gap-1 bg-gray-100 rounded-lg p-1">
        {#each availableOrderTypes as type}
          <button
            class="py-2 px-3 rounded-md text-xs font-medium transition-colors
              {orderType === type.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'}"
            on:click={() => orderType = type.id}
          >
            {type.name}
          </button>
        {/each}
      </div>
    </div>

    <!-- Buy/Sell Buttons -->
    <div class="grid grid-cols-2 gap-2">
      <button
        class="py-3 px-4 rounded-md text-sm font-medium transition-colors
          {positionType === 'buy'
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        on:click={() => positionType = 'buy'}
      >
        {$t('tradingForm.positions.buyLong')}
      </button>
      <button
        class="py-3 px-4 rounded-md text-sm font-medium transition-colors
          {positionType === 'sell'
            ? 'bg-red-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        on:click={() => positionType = 'sell'}
      >
        {$t('tradingForm.positions.sellShort')}
      </button>
    </div>

    <!-- Leverage (for Margin/Futures) -->
    {#if activeTab === 'margin' || activeTab === 'futures'}
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {$t('tradingForm.labels.leverage', { value: leverage })}
        </label>
        <div class="grid grid-cols-4 gap-1">
          {#each leverageOptions as lev}
            <button
              class="py-1 px-2 text-xs rounded border transition-colors
                {leverage === lev
                  ? 'bg-primary-100 border-primary-300 text-primary-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}"
              on:click={() => leverage = lev}
            >
              {lev}x
            </button>
          {/each}
        </div>
      </div>

      <!-- Margin Mode (for Margin/Futures) -->
      <div class="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          class="flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors
            {marginMode === 'cross'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'}"
          on:click={() => marginMode = 'cross'}
        >
          {$t('tradingForm.marginModes.cross')}
        </button>
        <button
          class="flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors
            {marginMode === 'isolated'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'}"
          on:click={() => marginMode = 'isolated'}
        >
          {$t('tradingForm.marginModes.isolated')}
        </button>
      </div>
    {/if}

    <!-- Spot Trading Info -->
    {#if activeTab === 'spot'}
      <div class="bg-blue-50 rounded-lg p-3">
        <div class="text-xs text-blue-600 mb-1">{$t('tradingForm.info.spot.title')}</div>
        <div class="text-xs text-blue-800">{$t('tradingForm.info.spot.description')}</div>
      </div>
    {/if}

    <!-- Margin Trading Info -->
    {#if activeTab === 'margin'}
      <div class="bg-orange-50 rounded-lg p-3">
        <div class="text-xs text-orange-600 mb-1">{$t('tradingForm.info.margin.title')}</div>
        <div class="text-xs text-orange-800">{$t('tradingForm.info.margin.description')}</div>
      </div>
    {/if}

    <!-- Futures Trading Info -->
    {#if activeTab === 'futures'}
      <div class="bg-purple-50 rounded-lg p-3">
        <div class="text-xs text-purple-600 mb-1">{$t('tradingForm.info.futures.title')}</div>
        <div class="text-xs text-purple-800">{$t('tradingForm.info.futures.description')}</div>
      </div>
    {/if}

    <!-- Available Balance -->
    <div class="bg-gray-50 rounded-lg p-3">
      <div class="text-xs text-gray-600 mb-1">{$t('tradingForm.labels.availableBalance')}</div>
      <div class="font-medium">1,000.00 USDC</div>
    </div>

    <!-- Price Input (for Limit orders) -->
    {#if orderType === 'limit' || orderType === 'stop' || orderType === 'oco'}
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {orderType === 'stop' ? $t('tradingForm.labels.stopPrice') : $t('tradingForm.labels.price')}
        </label>
        <div class="relative">
          <input
            type="number"
            bind:value={price}
            placeholder="0.00"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <div class="absolute right-3 top-2 text-sm text-gray-500">USDC</div>
        </div>
      </div>
    {/if}

    <!-- Stop Price (for Stop orders) -->
    {#if orderType === 'stop' || orderType === 'oco'}
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{$t('tradingForm.labels.limitPrice')}</label>
        <div class="relative">
          <input
            type="number"
            bind:value={stopPrice}
            placeholder="0.00"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <div class="absolute right-3 top-2 text-sm text-gray-500">USDC</div>
        </div>
      </div>
    {/if}

    <!-- Amount Input -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">{$t('tradingForm.labels.amount')}</label>
      <div class="relative">
        <input
          type="number"
          bind:value={amount}
          placeholder="0.00"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <div class="absolute right-3 top-2 text-sm text-gray-500">
          {pair.split('-')[0]}
        </div>
      </div>
    </div>

    <!-- Percentage Buttons -->
    <div class="grid grid-cols-4 gap-2">
      {#each [25, 50, 75, 100] as percentage}
        <button
          on:click={() => setPercentage(percentage)}
          class="py-1 px-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          {percentage}%
        </button>
      {/each}
    </div>

    <!-- Total -->
    {#if amount && price && orderType !== 'market'}
      <div class="bg-gray-50 rounded-lg p-3">
        <div class="text-xs text-gray-600 mb-1">{$t('tradingForm.labels.total')}</div>
        <div class="font-medium">{(parseFloat(amount) * parseFloat(price)).toFixed(2)} USDC</div>
      </div>
    {/if}
  </div>

  <!-- Trade Button -->
  <div class="p-4 border-t">
    {#if !isConnected}
      <button
        on:click={connectWallet}
        class="w-full bg-primary-600 text-white py-3 rounded-md font-medium hover:bg-primary-700 transition-colors"
      >
        {$t('tradingForm.buttons.connectWallet')}
      </button>
    {:else if !canTrade}
      <button
        disabled
        class="w-full bg-gray-300 text-gray-500 py-3 rounded-md font-medium cursor-not-allowed"
      >
        {orderType === 'market'
          ? $t('tradingForm.buttons.enterAmount')
          : $t('tradingForm.buttons.enterAmountAndPrice')
        }
      </button>
    {:else}
      <button
        on:click={handleTrade}
        class="w-full py-3 rounded-md font-medium transition-colors
          {positionType === 'buy'
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-red-600 text-white hover:bg-red-700'}"
      >
        {$t('tradingForm.buttons.trade', {
          action: positionType === 'buy' ? $t('tradingForm.positions.buy') : $t('tradingForm.positions.sell'),
          token: pair.split('-')[0]
        })}
      </button>
    {/if}

    <!-- Fees Info -->
    <div class="text-xs text-gray-500 mt-2 space-y-1">
      <div class="flex justify-between">
        <span>{$t('tradingForm.fees.estimatedFee')}</span>
        <span>0.1%</span>
      </div>
      {#if activeTab !== 'spot'}
        <div class="flex justify-between">
          <span>{$t('tradingForm.fees.fundingRate')}</span>
          <span class="text-green-600">0.0238%</span>
        </div>
      {/if}
    </div>
  </div>
</div>