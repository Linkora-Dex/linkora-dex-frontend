<script>
  import { t } from '$lib/utils/i18n.js';

  let slippageTolerance = '0.5';
  let gasPriceMode = 'standard';
  let theme = 'light';
  let notifications = {
    orderFills: true,
    priceAlerts: false,
    newListings: true,
    systemUpdates: true
  };

  function saveSettings() {
    console.log('Saving settings:', { slippageTolerance, gasPriceMode, theme, notifications });
  }
</script>

<svelte:head>
  <title>{$t('settings.meta.title')}</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">{$t('settings.title')}</h1>
    <p class="text-gray-600">{$t('settings.description')}</p>
  </div>

  <div class="space-y-6">
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">{$t('settings.trading.title')}</h2>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{$t('settings.trading.slippage.label')}</label>
          <div class="flex space-x-2">
            {#each ['0.1', '0.5', '1.0'] as value}
              <button
                class="px-3 py-2 rounded-md border text-sm font-medium transition-colors
                  {slippageTolerance === value
                    ? 'bg-primary-100 border-primary-300 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}"
                on:click={() => slippageTolerance = value}
              >
                {value}%
              </button>
            {/each}
            <input
              type="text"
              bind:value={slippageTolerance}
              class="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder={$t('settings.trading.slippage.customPlaceholder')}
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{$t('settings.trading.gasPrice.label')}</label>
          <select bind:value={gasPriceMode} class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="slow">{$t('settings.trading.gasPrice.slow')}</option>
            <option value="standard">{$t('settings.trading.gasPrice.standard')}</option>
            <option value="fast">{$t('settings.trading.gasPrice.fast')}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">{$t('settings.appearance.title')}</h2>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">{$t('settings.appearance.theme.label')}</label>
        <div class="flex space-x-2">
          <button
            class="px-4 py-2 rounded-md border text-sm font-medium transition-colors
              {theme === 'light'
                ? 'bg-primary-100 border-primary-300 text-primary-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}"
            on:click={() => theme = 'light'}
          >
            {$t('settings.appearance.theme.light')}
          </button>
          <button
            class="px-4 py-2 rounded-md border text-sm font-medium transition-colors
              {theme === 'dark'
                ? 'bg-primary-100 border-primary-300 text-primary-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}"
            on:click={() => theme = 'dark'}
          >
            {$t('settings.appearance.theme.dark')}
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">{$t('settings.notifications.title')}</h2>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-medium text-gray-900">{$t('settings.notifications.orderFills.title')}</div>
            <div class="text-sm text-gray-500">{$t('settings.notifications.orderFills.description')}</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" bind:checked={notifications.orderFills} class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-medium text-gray-900">{$t('settings.notifications.priceAlerts.title')}</div>
            <div class="text-sm text-gray-500">{$t('settings.notifications.priceAlerts.description')}</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" bind:checked={notifications.priceAlerts} class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-medium text-gray-900">{$t('settings.notifications.newListings.title')}</div>
            <div class="text-sm text-gray-500">{$t('settings.notifications.newListings.description')}</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" bind:checked={notifications.newListings} class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-medium text-gray-900">{$t('settings.notifications.systemUpdates.title')}</div>
            <div class="text-sm text-gray-500">{$t('settings.notifications.systemUpdates.description')}</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" bind:checked={notifications.systemUpdates} class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button
        on:click={saveSettings}
        class="bg-primary-600 text-white px-6 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
      >
        {$t('settings.saveButton')}
      </button>
    </div>
  </div>
</div>