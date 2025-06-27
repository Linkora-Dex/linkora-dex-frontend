<script>
  const orders = [];

  function cancelOrder(orderId) {
    console.log('Cancelling order:', orderId);
  }

  function modifyOrder(orderId) {
    console.log('Modifying order:', orderId);
  }
</script>

{#if orders.length === 0}
  <div class="text-center py-12">
    <div class="text-gray-500 mb-2">No active orders</div>
    <div class="text-sm text-gray-400">Create an order to see it here</div>
  </div>
{:else}
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Market</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Side</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        {#each orders as order}
          <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.market}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.type}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span class="px-2 py-1 rounded-full text-xs font-medium {order.side === 'Long' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                {order.side}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.size}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.price}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                {order.status}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
              <button
                on:click={() => modifyOrder(order.id)}
                class="text-primary-600 hover:text-primary-700 font-medium"
              >
                Modify
              </button>
              <button
                on:click={() => cancelOrder(order.id)}
                class="text-red-600 hover:text-red-700 font-medium"
              >
                Cancel
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}