<script>
  export let pair = 'ETH-PERP';
  import { t } from '$lib/utils/i18n.js';

  const recentTrades = [
    { price: '2,500.1', size: '0.570', time: '11:14:15', side: 'buy' },
    { price: '2,510.0', size: '0.570', time: '10:08:22', side: 'sell' },
    { price: '2,514.7', size: '0.570', time: '09:17:14', side: 'buy' },
    { price: '2,500.1', size: '0.570', time: '08:23:21', side: 'buy' },
    { price: '2,523.9', size: '0.570', time: '07:29:06', side: 'sell' },
    { price: '2,498.3', size: '0.342', time: '06:45:12', side: 'buy' },
    { price: '2,505.8', size: '0.820', time: '05:33:45', side: 'sell' },
    { price: '2,492.1', size: '1.250', time: '04:22:18', side: 'buy' }
  ];
</script>

<div class="h-full flex flex-col p-4">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold text-gray-900">{$t('recentTrades.title')}</h3>
    <span class="text-sm text-gray-500">{pair}</span>
  </div>

  <div class="flex-1 overflow-hidden">
    <div class="grid grid-cols-3 gap-4 text-xs font-medium text-gray-500 pb-2 border-b">
      <span>{$t('recentTrades.headers.price')}</span>
      <span>{$t('recentTrades.headers.size', { token: pair.split('-')[0] })}</span>
      <span>{$t('recentTrades.headers.time')}</span>
    </div>

    <div class="mt-2 space-y-1 overflow-y-auto max-h-full">
      {#each recentTrades as trade}
        <div class="grid grid-cols-3 gap-4 text-sm py-1 hover:bg-gray-50 rounded transition-colors">
          <span class="font-mono {trade.side === 'buy' ? 'text-green-600' : 'text-red-600'}">
            {trade.price}
          </span>
          <span class="font-mono text-gray-700">{trade.size}</span>
          <span class="text-gray-500 text-xs">{trade.time}</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="mt-4 pt-4 border-t">
    <button class="w-full text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
      {$t('recentTrades.buttons.viewAll')}
    </button>
  </div>
</div>