<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  // import Chart from '$lib/components/trading/Chart.svelte';
  import OrderBook from '$lib/components/trading/OrderBook.svelte';
  import TradingForm from '$lib/components/trading/TradingForm.svelte';
  import RecentTrades from '$lib/components/trading/RecentTrades.svelte';
  import { t } from '$lib/utils/i18n.js';

   import { ChartPro, DefaultDatafeed, createSymbolInfo, createPeriod, SymbolType, PeriodTimespan } from '../../lib/chart-pro';
    import ChartToolbar from '../../lib/chart-pro/components/chart-toolbar/ChartToolbar.svelte';

    // ******************* //
   let datafeed = new DefaultDatafeed();
   let symbol = createSymbolInfo('BTCUSDT', {
   name: 'Bitcoin / Tether',
   shortName: 'BTCUSDT',
   exchange: 'Binance Spot',
   market: 'crypto',
   type: SymbolType.CRYPTO,
   priceCurrency: 'USDT'
   });
   let period = createPeriod(15, PeriodTimespan.MINUTE, '15m');
   // ******************* //

  let currentPair = $page.url.searchParams.get('pair') || 'ETH-PERP';
  let showPairDropdown = false;

  function selectPair(selectedPair) {
    currentPair = selectedPair;
    const url = new URL($page.url);
    url.searchParams.set('pair', selectedPair);
    goto(url.toString(), { replaceState: true });
    showPairDropdown = false;
  }

  function closePairDropdown() {
    showPairDropdown = false;
  }

  function goToMarkets() {
    goto('/markets');
  }

  function goToSwap() {
    goto('/swap');
  }
</script>

<svelte:head>
  <title>{$t('trade.meta.title', { pair: currentPair })}</title>
</svelte:head>

<div class="h-screen bg-white flex flex-col">
  <!-- Header -->
  <div class="p-1 border-b bg-white">
   <ChartToolbar/>
  </div>

  <!-- Main Trading Interface - 3 columns -->
  <div class="flex-1 grid grid-cols-12 min-h-0">
    <!-- Left: Chart + Recent Trades (60%) -->
    <div class="col-span-12 lg:col-span-7 xl:col-span-7 flex flex-col border-r">
      <!-- Chart -->
      <div class="flex-1">

      <ChartPro
       {datafeed}
       {symbol}
       {period}
       theme="light"
       showToolbar={true}
       showDrawingTools={true}
       showIndicators={true}
       showSettings={true}
      />

<!--        <Chart pair={currentPair} />-->
      </div>

      <!-- Recent Trades -->
      <div class="h-48 border-t overflow-hidden">
        <RecentTrades pair={currentPair} />
      </div>
    </div>

    <!-- Middle: Order Book (20%) -->
    <div class="col-span-12 lg:col-span-2 xl:col-span-2 border-r bg-gray-50">
      <OrderBook pair={currentPair} />
    </div>

    <!-- Right: Trading Form (20%) -->
    <div class="col-span-12 lg:col-span-3 xl:col-span-3 bg-white">
      <TradingForm pair={currentPair} />
    </div>
  </div>
</div>

<svelte:window on:click={closePairDropdown} />