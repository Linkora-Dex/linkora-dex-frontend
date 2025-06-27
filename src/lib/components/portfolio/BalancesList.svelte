<script>
  const balances = [
    { token: 'ETH', name: 'Ethereum', total: '0.0000', available: '0.0000', locked: '0.0000', value: '$0.00' },
    { token: 'USDC', name: 'USD Coin', total: '0.0000', available: '0.0000', locked: '0.0000', value: '$0.00' },
    { token: 'CAPY', name: 'Capy Token', total: '0.0000', available: '0.0000', locked: '0.0000', value: '$0.00' },
    { token: 'AXOL', name: 'Axol Token', total: '0.0000', available: '0.0000', locked: '0.0000', value: '$0.00' },
    { token: 'QUOK', name: 'Quok Token', total: '0.0000', available: '0.0000', locked: '0.0000', value: '$0.00' }
  ];

  function deposit(token) {
    console.log('Deposit', token);
  }

  function withdraw(token) {
    console.log('Withdraw', token);
  }
</script>

<div class="overflow-x-auto">
  <table class="min-w-full divide-y divide-gray-200">
    <thead>
      <tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Balance</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Locked</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">USD Value</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200">
      {#each balances as balance}
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap">
            <div>
              <div class="text-sm font-medium text-gray-900">{balance.token}</div>
              <div class="text-sm text-gray-500">{balance.name}</div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{balance.total}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{balance.available}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{balance.locked}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{balance.value}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
            <button
              on:click={() => deposit(balance.token)}
              class="text-primary-600 hover:text-primary-700 font-medium"
            >
              Deposit
            </button>
            <button
              on:click={() => withdraw(balance.token)}
              class="text-gray-600 hover:text-gray-700 font-medium"
            >
              Withdraw
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>