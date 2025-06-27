<script>
  import { walletStore } from '$lib/stores/wallet.js';
  import { t } from '$lib/utils/i18n.js';

  let isConnected = false;
  let address = '';
  let isConnecting = false;
  let error = '';

  walletStore.subscribe(state => {
    isConnected = state.isConnected;
    address = state.address;
  });

  async function connectWallet() {
    if (isConnecting) return;

    isConnecting = true;
    error = '';

    try {
      await walletStore.connect();
    } catch (err) {
      error = err.message || 'Failed to connect wallet';
      console.error('Wallet connection error:', err);
    } finally {
      isConnecting = false;
    }
  }

  function disconnectWallet() {
    walletStore.disconnect();
    error = '';
  }

  function formatAddress(addr) {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  function clearError() {
    error = '';
  }
</script>

{#if isConnected}
  <div class="flex items-center space-x-3">
    <div class="flex items-center space-x-2">
      <div class="w-2 h-2 bg-green-500 rounded-full"></div>
      <span class="text-sm text-gray-700">{formatAddress(address)}</span>
    </div>
    <button
      on:click={disconnectWallet}
      class="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
    >
      {$t('header.disconnect')}
    </button>
  </div>
{:else}
  <div class="flex flex-col items-end space-y-2">
    <button
      on:click={connectWallet}
      disabled={isConnecting}
      class="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
    >
      {#if isConnecting}
        <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{$t('header.connecting')}</span>
      {:else}
        <span>{$t('header.connectWallet')}</span>
      {/if}
    </button>

    {#if error}
      <div class="bg-red-50 border border-red-200 rounded-md p-2 max-w-xs">
        <div class="flex items-center justify-between">
          <p class="text-xs text-red-600">{error}</p>
          <button on:click={clearError} class="text-red-400 hover:text-red-600">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    {/if}
  </div>
{/if}