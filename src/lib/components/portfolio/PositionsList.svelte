<script>
  const positions = [];
</script>

{#if positions.length === 0}
  <div class="text-center py-12">
    <div class="text-gray-500 mb-2">No open positions</div>
    <div class="text-sm text-gray-400">Open a position to start trading</div>
  </div>
{:else}
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Market</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Side</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry Price</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mark Price</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PnL</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        {#each positions as position}
          <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{position.market}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span class="px-2 py-1 rounded-full text-xs font-medium {position.side === 'Long' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                {position.side}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{position.size}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{position.entryPrice}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{position.markPrice}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span class="{position.pnl.startsWith('+') ? 'text-green-600' : 'text-red-600'}">{position.pnl}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <button class="text-red-600 hover:text-red-700 font-medium">Close</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}