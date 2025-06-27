<script>
  const history = [];

  let filterType = 'all';
  const filterOptions = [
    { id: 'all', name: 'All' },
    { id: 'trades', name: 'Trades' },
    { id: 'deposits', name: 'Deposits' },
    { id: 'withdrawals', name: 'Withdrawals' },
    { id: 'orders', name: 'Orders' }
  ];

  function getTypeColor(type) {
    switch (type) {
      case 'Buy': return 'bg-green-100 text-green-700';
      case 'Sell': return 'bg-red-100 text-red-700';
      case 'Deposit': return 'bg-blue-100 text-blue-700';
      case 'Withdraw': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
</script>

<div class="space-y-4">
  <div class="flex space-x-2">
    {#each filterOptions as option}
      <button
        class="px-3 py-1 rounded-md text-sm font-medium transition-colors
          {filterType === option.id
            ? 'bg-primary-100 text-primary-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
        on:click={() => filterType = option.id}
      >
        {option.name}
      </button>
    {/each}
  </div>

  {#if history.length === 0}
    <div class="text-center py-12">
      <div class="text-gray-500 mb-2">No transaction history</div>
      <div class="text-sm text-gray-400">Your trading activity will appear here</div>
    </div>
  {:else}
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Market</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          {#each history as item}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 py-1 rounded-full text-xs font-medium {getTypeColor(item.type)}">
                  {item.type}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.market}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{item.amount}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{item.price}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.fee}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  {item.status}
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>