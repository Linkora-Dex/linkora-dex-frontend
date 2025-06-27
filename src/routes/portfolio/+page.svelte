<!-- src/routes/portfolio/+page.svelte -->
<script>
 import { onMount, onDestroy } from 'svelte';
 import { page } from '$app/stores';
 import { goto } from '$app/navigation';
 import { t } from '$lib/utils/i18n.js';
 import Tabs from '$lib/components/ui/Tabs.svelte';
 import PositionsList from '$lib/components/portfolio/PositionsList.svelte';
 import OrdersList from '$lib/components/portfolio/OrdersList.svelte';
 import BalancesList from '$lib/components/portfolio/BalancesList.svelte';
 import HistoryList from '$lib/components/portfolio/HistoryList.svelte';
 import { walletStore } from '$lib/stores/wallet.js';

 // Blockchain imports
 import {
   DexAPI,
   portfolio,
   balances,
   positions,
   orders,
   history,
   isConnected,
   userAddress,
   isLoadingPortfolio,
   error
 } from '$lib/blockchain';

 let isWalletConnected = false;
 let walletAddress = '';
 let isInitialized = false;
 let refreshInterval;

 // Subscribe to wallet state
 walletStore.subscribe(state => {
   isWalletConnected = state.isConnected;
   walletAddress = state.address;
 });

 // Subscribe to blockchain connection state
 $: blockchainConnected = $isConnected;
 $: currentAddress = $userAddress;
 $: isLoading = $isLoadingPortfolio;
 $: blockchainError = $error;

 // Reactive portfolio data from blockchain
 $: portfolioData = $portfolio;
 $: userBalances = $balances;
 $: userPositions = $positions;
 $: userOrders = $orders;
 $: userHistory = $history;

 // URL state management
 $: activeTab = $page.url.searchParams.get('tab') || 'positions';

 $: tabs = [
   { id: 'positions', name: $t('portfolio.tabs.positions'), icon: '📊' },
   { id: 'orders', name: $t('portfolio.tabs.orders'), icon: '📋' },
   { id: 'balances', name: $t('portfolio.tabs.balances'), icon: '💰' },
   { id: 'history', name: $t('portfolio.tabs.history'), icon: '📜' }
 ];

 $: periods = [
   { id: '24h', name: $t('portfolio.periods.24h') },
   { id: '7d', name: $t('portfolio.periods.7d') },
   { id: '30d', name: $t('portfolio.periods.30d') },
   { id: '90d', name: $t('portfolio.periods.90d') }
 ];

 let activePeriod = '24h';

 // Initialize blockchain connection when wallet connects
 onMount(async () => {
   console.log('Portfolio page mounted');

   if (isWalletConnected && walletAddress && !isInitialized) {
     await initializeBlockchain();
   }

   // Set up auto-refresh
   refreshInterval = setInterval(async () => {
     if (isWalletConnected && isInitialized && !isLoading) {
       await refreshPortfolioData();
     }
   }, 30000); // Refresh every 30 seconds
 });

 onDestroy(() => {
   if (refreshInterval) {
     clearInterval(refreshInterval);
   }
 });

 // Watch for wallet connection changes
 $: if (isWalletConnected && walletAddress && !isInitialized) {
   initializeBlockchain();
 }

 $: if (!isWalletConnected && isInitialized) {
   resetPortfolioData();
 }

 async function initializeBlockchain() {
   try {
     console.log('Initializing blockchain connection...');
     isInitialized = true;

     // Initialize DexAPI with current network
     await DexAPI.init({
       rpcUrl: 'http://localhost:8545',
       chainId: 31337,
       autoConnect: false // We already have wallet connected
     });

     // Load portfolio data
     await DexAPI.refreshPortfolio();

     console.log('✅ Blockchain initialized and portfolio loaded');
   } catch (error) {
     console.error('❌ Failed to initialize blockchain:', error);
     isInitialized = false;
   }
 }

 async function refreshPortfolioData() {
   try {
     if (!isInitialized) return;

     console.log('🔄 Refreshing portfolio data...');
     await DexAPI.refreshPortfolio();
     console.log('✅ Portfolio data refreshed');
   } catch (error) {
     console.error('❌ Failed to refresh portfolio:', error);
   }
 }

 function resetPortfolioData() {
   isInitialized = false;
   console.log('🔄 Reset portfolio data due to wallet disconnect');
 }

 function setTab(tabId) {
   const url = new URL($page.url);
   if (tabId === 'positions') {
     url.searchParams.delete('tab');
   } else {
     url.searchParams.set('tab', tabId);
   }
   goto(url.toString(), { replaceState: true });
 }

 async function connectWallet() {
   try {
     await walletStore.connect();
   } catch (error) {
     console.error('Failed to connect wallet:', error);
   }
 }

 // Portfolio action handlers
 async function handleDeposit() {
   try {
     // This would open a deposit modal in a real implementation
     console.log('Opening deposit modal...');
     // Example: await DexAPI.deposit('ETH', '1.0');
   } catch (error) {
     console.error('Deposit failed:', error);
   }
 }

 async function handleWithdraw() {
   try {
     // This would open a withdraw modal in a real implementation
     console.log('Opening withdraw modal...');
     // Example: await DexAPI.withdraw('ETH', '0.5');
   } catch (error) {
     console.error('Withdraw failed:', error);
   }
 }

 // Format currency values
 function formatCurrency(value, currency = 'USD') {
   if (value === null || value === undefined || isNaN(value)) return '$0.00';
   return new Intl.NumberFormat('en-US', {
     style: 'currency',
     currency: currency,
     minimumFractionDigits: 2,
     maximumFractionDigits: 2
   }).format(value);
 }

 function formatPercentage(value) {
   if (value === null || value === undefined || isNaN(value)) return '—';
   const sign = value >= 0 ? '+' : '';
   return `${sign}${value.toFixed(2)}%`;
 }

 function getChangeColor(value) {
   if (value > 0) return 'text-green-600';
   if (value < 0) return 'text-red-600';
   return 'text-gray-500';
 }
</script>

<svelte:head>
 <title>{$t('portfolio.meta.title')}</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 {#if !isWalletConnected}
   <!-- Wallet Connection Screen -->
   <div class="text-center py-16">
     <div class="mb-8">
       <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
         <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
         </svg>
       </div>
       <h2 class="text-2xl font-bold text-gray-900 mb-2">{$t('portfolio.connect.title')}</h2>
       <p class="text-gray-600 mb-8">{$t('portfolio.connect.description')}</p>
       <button
         on:click={connectWallet}
         class="bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors"
       >
         {$t('portfolio.connect.button')}
       </button>
     </div>
   </div>
 {:else}
   <!-- Portfolio Content -->
   <div class="mb-8">
     <div class="bg-white rounded-lg border border-gray-200 p-6">
       {#if blockchainError}
         <!-- Error State -->
         <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
           <div class="flex">
             <div class="flex-shrink-0">
               <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                 <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
               </svg>
             </div>
             <div class="ml-3">
               <h3 class="text-sm font-medium text-red-800">{$t('portfolio.error.title')}</h3>
               <p class="text-sm text-red-700 mt-1">{blockchainError}</p>
               <button
                 on:click={initializeBlockchain}
                 class="mt-2 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
               >
                 {$t('portfolio.error.retryButton')}
               </button>
             </div>
           </div>
         </div>
       {/if}

       <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
         <div>
           <h1 class="text-3xl font-bold text-gray-900 mb-2">{$t('portfolio.title')}</h1>
           <div class="flex items-center space-x-4">
             <div>
               <span class="text-sm text-gray-500">{$t('portfolio.stats.totalBalance')}</span>
               <div class="text-2xl font-bold">
                 {#if isLoading}
                   <div class="animate-pulse bg-gray-300 h-8 w-24 rounded"></div>
                 {:else}
                   {formatCurrency(portfolioData.totalBalance)}
                 {/if}
               </div>
             </div>
             <div>
               <span class="text-sm text-gray-500">{$t('portfolio.stats.pnl24h')}</span>
               <div class="text-lg font-semibold {getChangeColor(portfolioData.pnl24h)}">
                 {#if isLoading}
                   <div class="animate-pulse bg-gray-300 h-6 w-16 rounded"></div>
                 {:else}
                   {formatPercentage(portfolioData.pnl24h)}
                 {/if}
               </div>
             </div>
             {#if currentAddress}
               <div>
                 <span class="text-sm text-gray-500">{$t('portfolio.stats.wallet')}</span>
                 <div class="text-xs font-mono text-gray-700">
                   {currentAddress.slice(0, 6)}...{currentAddress.slice(-4)}
                 </div>
               </div>
             {/if}
           </div>
         </div>

         <div class="flex space-x-2">
           {#each periods as period}
             <button
               class="px-3 py-1 rounded text-sm font-medium transition-colors
               {activePeriod === period.id
                 ? 'bg-primary-100 text-primary-700'
                 : 'text-gray-500 hover:text-gray-700'}"
               on:click={() => activePeriod = period.id}
             >
               {period.name}
             </button>
           {/each}
         </div>
       </div>

       <!-- Portfolio Stats Grid -->
       <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
         <div class="bg-gray-50 rounded-md p-4">
           <div class="text-sm text-gray-500 mb-1">{$t('portfolio.balances.available')}</div>
           <div class="font-semibold">
             {#if isLoading}
               <div class="animate-pulse bg-gray-300 h-5 w-16 rounded"></div>
             {:else}
               {formatCurrency(portfolioData.availableBalance)}
             {/if}
           </div>
         </div>
         <div class="bg-gray-50 rounded-md p-4">
           <div class="text-sm text-gray-500 mb-1">{$t('portfolio.balances.locked')}</div>
           <div class="font-semibold">
             {#if isLoading}
               <div class="animate-pulse bg-gray-300 h-5 w-16 rounded"></div>
             {:else}
               {formatCurrency(portfolioData.lockedBalance)}
             {/if}
           </div>
         </div>
         <div class="bg-gray-50 rounded-md p-4">
           <div class="text-sm text-gray-500 mb-1">{$t('portfolio.balances.totalCollateral')}</div>
           <div class="font-semibold">
             {#if isLoading}
               <div class="animate-pulse bg-gray-300 h-5 w-16 rounded"></div>
             {:else}
               {formatCurrency(portfolioData.totalCollateral)}
             {/if}
           </div>
         </div>
         <div class="bg-gray-50 rounded-md p-4">
           <div class="text-sm text-gray-500 mb-1">{$t('portfolio.balances.freeCollateral')}</div>
           <div class="font-semibold">
             {#if isLoading}
               <div class="animate-pulse bg-gray-300 h-5 w-16 rounded"></div>
             {:else}
               {formatCurrency(portfolioData.freeCollateral)}
             {/if}
           </div>
         </div>
       </div>

       <!-- Action Buttons -->

     </div>
   </div>

   <!-- Portfolio Data Tables -->
   <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
     <Tabs {tabs} {activeTab} onTabChange={setTab} />

     <div class="p-6">
       {#if isLoading}
         <!-- Loading State -->
         <div class="text-center py-12">
           <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
           <div class="text-gray-500">{$t('portfolio.loading.message')}</div>
         </div>
       {:else if activeTab === 'positions'}
         <PositionsList {userPositions} />
       {:else if activeTab === 'orders'}
         <OrdersList {userOrders} />
       {:else if activeTab === 'balances'}
         <BalancesList {userBalances} />
       {:else if activeTab === 'history'}
         <HistoryList {userHistory} />
       {/if}
     </div>
   </div>

   <!-- Connection Status Footer -->
   <div class="mt-4 text-center text-sm text-gray-500">
     {#if isInitialized}
       <span class="inline-flex items-center">
         <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
         {$t('portfolio.status.connected')}
         {#if portfolioData.lastUpdate}
           • {$t('portfolio.status.lastUpdate')}: {new Date(portfolioData.lastUpdate).toLocaleTimeString()}
         {/if}
       </span>
     {:else}
       <span class="inline-flex items-center">
         <span class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
         {$t('portfolio.status.connecting')}
       </span>
     {/if}
   </div>
 {/if}
</div>