<script>
  export let pair = 'ETH-PERP';
  import { t } from '$lib/utils/i18n.js';

  const sellOrders = [
    { price: '2,505.1', size: '4.579', total: '11,472.2' },
    { price: '2,504.7', size: '5.097', total: '13,768.3' },
    { price: '2,504.1', size: '9.164', total: '22,947.5' },
    { price: '2,503.6', size: '18.332', total: '45,895.9' }
  ];

  const buyOrders = [
    { price: '2,502.9', size: '2.505', total: '6,269.8' },
    { price: '2,502.8', size: '21.301', total: '53,311.9' },
    { price: '2,502.6', size: '31.955', total: '79,970.5' },
    { price: '2,502.3', size: '21.305', total: '53,311.9' }
  ];

  const currentPrice = '2,502.9';
</script>

<div class="h-full flex flex-col">
  <div class="p-4 border-b">
    <h3 class="text-sm font-medium text-gray-900 mb-2">{$t('orderBook.title')}</h3>
    <div class="grid grid-cols-3 gap-4 text-xs text-gray-500">
      <span>{$t('orderBook.headers.price')}</span>
      <span>{$t('orderBook.headers.size')}</span>
      <span>{$t('orderBook.headers.total')}</span>
    </div>
  </div>

  <div class="flex-1 overflow-hidden">
    <div class="h-full flex flex-col">
      <div class="flex-1 overflow-y-auto">
        {#each sellOrders as order}
          <div class="grid grid-cols-3 gap-2 px-4 py-1 text-xs hover:bg-red-50">
            <span class="text-red-600 font-mono">{order.price}</span>
            <span class="text-gray-700 font-mono">{order.size}</span>
            <span class="text-gray-500 font-mono">{order.total}</span>
          </div>
        {/each}
      </div>

      <div class="px-4 py-2 bg-gray-50 border-y">
        <div class="text-center">
          <div class="text-lg font-bold text-green-600">{currentPrice}</div>
          <div class="text-xs text-gray-500">{$t('orderBook.lastPrice')}</div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        {#each buyOrders as order}
          <div class="grid grid-cols-3 gap-2 px-4 py-1 text-xs hover:bg-green-50">
            <span class="text-green-600 font-mono">{order.price}</span>
            <span class="text-gray-700 font-mono">{order.size}</span>
            <span class="text-gray-500 font-mono">{order.total}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>