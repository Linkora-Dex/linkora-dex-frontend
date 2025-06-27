<script>
  import { page } from '$app/stores';
  import { walletStore } from '$lib/stores/wallet.js';
  import { t } from '$lib/utils/i18n.js';

  let isConnected = false;
  walletStore.subscribe(state => {
    isConnected = state.isConnected;
  });

  $: fromToken = $page.url.searchParams.get('from') || 'ETH';
  $: toToken = $page.url.searchParams.get('to') || 'USDC';
  $: amount = $page.url.searchParams.get('amount') || '';

  let fromAmount = amount;
  let toAmount = '0';
  let slippage = 0.5;

  const baseTokens = [
    { symbol: 'ETH', nameKey: 'swap.tokens.ethereum', balance: '0.0' },
    { symbol: 'USDC', nameKey: 'swap.tokens.usdCoin', balance: '0.0' },
    { symbol: 'CAPY', nameKey: 'swap.tokens.capyToken', balance: '0.0' },
    { symbol: 'AXOL', nameKey: 'swap.tokens.axolToken', balance: '0.0' },
    { symbol: 'QUOK', nameKey: 'swap.tokens.quokToken', balance: '0.0' },
    { symbol: 'PANG', nameKey: 'swap.tokens.pangToken', balance: '0.0' },
    { symbol: 'NARW', nameKey: 'swap.tokens.narwToken', balance: '0.0' }
  ];

  $: tokens = baseTokens.map(token => ({
    ...token,
    name: $t(token.nameKey)
  }));

  let showFromDropdown = false;
  let showToDropdown = false;

  $: fromTokenData = tokens.find(t => t.symbol === fromToken) || tokens[0] || baseTokens[0];
  $: toTokenData = tokens.find(t => t.symbol === toToken) || tokens[1] || baseTokens[1];

  function selectFromToken(token) {
    fromToken = token.symbol;
    showFromDropdown = false;
    updateEstimate();
  }

  function selectToToken(token) {
    toToken = token.symbol;
    showToDropdown = false;
    updateEstimate();
  }

  function swapTokens() {
    const tempSymbol = fromToken;
    fromToken = toToken;
    toToken = tempSymbol;
    fromAmount = toAmount;
    updateEstimate();
  }

  function updateEstimate() {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      toAmount = (parseFloat(fromAmount) * 0.998).toFixed(6);
    } else {
      toAmount = '0';
    }
  }

  function handleSwap() {
    if (!isConnected) {
      walletStore.connect();
      return;
    }
    console.log('Executing swap:', {
      fromToken: fromTokenData,
      toToken: toTokenData,
      fromAmount,
      toAmount
    });
  }

  function connectWallet() {
    walletStore.connect();
  }

  $: updateEstimate();
  $: canSwap = isConnected && fromAmount && parseFloat(fromAmount) > 0;
</script>

<svelte:head>
  <title>{$t('swap.meta.title')}</title>
</svelte:head>

<div class="max-w-md mx-auto px-4 py-8">
  <div class="text-center mb-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">{$t('swap.title')}</h1>
    <p class="text-gray-600">{$t('swap.description')}</p>
  </div>

  <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">{$t('swap.form.from')}</label>
        <div class="relative">
          <div class="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div class="flex items-center justify-between mb-2">
              <input
                type="number"
                placeholder="0"
                bind:value={fromAmount}
                class="bg-transparent text-2xl font-semibold outline-none flex-1"
              />
              <div class="relative">
                <button
                  on:click={() => showFromDropdown = !showFromDropdown}
                  class="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50"
                >
                  <span class="font-medium">{fromTokenData.symbol}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {#if showFromDropdown}
                  <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
                    {#each tokens as token}
                      <button
                        on:click={() => selectFromToken(token)}
                        class="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        <div class="font-medium">{token.symbol}</div>
                        <div class="text-sm text-gray-500">{token.name}</div>
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
            <div class="text-sm text-gray-500">
              {$t('swap.form.balance')}: {fromTokenData.balance} {fromTokenData.symbol}
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center">
        <button
          on:click={swapTokens}
          class="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">{$t('swap.form.to')}</label>
        <div class="relative">
          <div class="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div class="flex items-center justify-between mb-2">
              <input
                type="text"
                value={toAmount}
                readonly
                class="bg-transparent text-2xl font-semibold outline-none flex-1 text-gray-700"
              />
              <div class="relative">
                <button
                  on:click={() => showToDropdown = !showToDropdown}
                  class="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50"
                >
                  <span class="font-medium">{toTokenData.symbol}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {#if showToDropdown}
                  <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
                    {#each tokens as token}
                      <button
                        on:click={() => selectToToken(token)}
                        class="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        <div class="font-medium">{token.symbol}</div>
                        <div class="text-sm text-gray-500">{token.name}</div>
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
            <div class="text-sm text-gray-500">
              {$t('swap.form.balance')}: {toTokenData.balance} {toTokenData.symbol}
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 rounded-lg p-4 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">{$t('swap.details.priceImpact')}</span>
          <span class="font-medium">1 {toTokenData.symbol} ≈ 0.0010 {fromTokenData.symbol} (0.00%)</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">{$t('swap.details.swapFees')}</span>
          <span class="font-medium">0.00 {toTokenData.symbol} (0.3%)</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">{$t('swap.details.slippageTolerance')}</span>
          <span class="font-medium">{slippage}%</span>
        </div>
      </div>

      {#if !isConnected}
        <button
          on:click={connectWallet}
          class="w-full bg-primary-600 text-white py-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          {$t('swap.buttons.connectWallet')}
        </button>
      {:else if !canSwap}
        <button
          disabled
          class="w-full bg-gray-300 text-gray-500 py-4 rounded-lg font-medium cursor-not-allowed"
        >
          {$t('swap.buttons.enterAmount')}
        </button>
      {:else}
        <button
          on:click={handleSwap}
          class="w-full bg-primary-600 text-white py-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          {$t('swap.buttons.swapTokens', { from: fromTokenData.symbol, to: toTokenData.symbol })}
        </button>
      {/if}
    </div>
  </div>
</div>

<svelte:window on:click={() => {
  showFromDropdown = false;
  showToDropdown = false;
}} />