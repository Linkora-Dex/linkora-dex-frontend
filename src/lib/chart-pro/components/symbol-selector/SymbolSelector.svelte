<script>
 import { onMount } from 'svelte';
 import {
  currentSymbol,
  availableSymbols,
  loadSymbols,
  updateSymbol,
  searchSymbols
 } from '../../stores/chartStore.js';
 import { t } from '../../utils/i18n.js';

 let selectedSymbol = $currentSymbol;
 let searchValue = '';
 let showDropdown = false;
 let filteredSymbols = [];
 let symbolSelector;

 $: if ($currentSymbol) {
  selectedSymbol = $currentSymbol;
 }

 onMount(async () => {
  // Загрузка списка всех доступных символов при инициализации
  try {
    const symbols = await loadSymbols();
    console.log('Loaded symbols in SymbolSelector:', symbols.length);
    filteredSymbols = symbols;
  } catch (error) {
    console.error('Error loading symbols in SymbolSelector:', error);
  }

  // Добавляем обработчик клика вне компонента
  document.addEventListener('click', handleClickOutside);
  return () => {
   document.removeEventListener('click', handleClickOutside);
  };
 });

 function handleClickOutside(event) {
  // Защита от закрытия при непосредственном клике в компоненте
  const isClickInsideSelector = symbolSelector && symbolSelector.contains(event.target);
  const isDirectClick = event.target === symbolSelector;

  if (!isClickInsideSelector && showDropdown) {
   console.log('Closing dropdown: click outside');
   showDropdown = false;
  }
 }

 function handleSearchInput(event) {
  searchValue = event.target.value;
  filterSymbols();
 }

 function filterSymbols() {
  if (!searchValue) {
   filteredSymbols = $availableSymbols || [];
  } else {
   filteredSymbols = ($availableSymbols || []).filter(symbol => 
    symbol.ticker.toLowerCase().includes(searchValue.toLowerCase()) ||
    symbol.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    symbol.shortName?.toLowerCase().includes(searchValue.toLowerCase())
   );
  }
 }

 function handleSelectSymbol(symbol, event) {
  if (event) {
   event.stopPropagation();
  }
  updateSymbol(symbol);
  searchValue = symbol.ticker;
  showDropdown = false;
 }

 function toggleDropdown(event) {
  if (event) {
   event.stopPropagation();
  }
  showDropdown = !showDropdown;
  if (showDropdown) {
   filteredSymbols = $availableSymbols || [];
  }
 }

 function handleInputFocus(event) {
  if (event) {
   event.stopPropagation();
  }
  if (!filteredSymbols.length) {
   filteredSymbols = $availableSymbols || [];
  }
  showDropdown = true;
 }
</script>

<div class="symbol-selector" bind:this={symbolSelector}>
 <div class="selected-symbol" on:click={(e) => toggleDropdown(e)}>
  {#if selectedSymbol}
   <span class="symbol-ticker">{selectedSymbol.ticker}</span>
   <span class="dropdown-arrow">▼</span>
  {:else}
   <span class="placeholder">{t('symbol_search')}</span>
   <span class="dropdown-arrow">▼</span>
  {/if}
 </div>

 <div class="search-box" class:active={showDropdown}>
  {#if showDropdown}
   <input
    type="text"
    placeholder={t('symbol_search')}
    bind:value={searchValue}
    on:input={(e) => { e.stopPropagation(); handleSearchInput(e); }}
    on:focus={(e) => handleInputFocus(e)}
    on:click={(e) => e.stopPropagation()}
    autocomplete="off"
   />

   <div class="symbol-dropdown">
    {#if filteredSymbols.length > 0}
     {#each filteredSymbols.slice(0, 20) as symbol}
      <div 
       class="symbol-item" 
       role="button" 
       tabindex="0"
       class:active={selectedSymbol && symbol.ticker === selectedSymbol.ticker}
       on:click={(e) => handleSelectSymbol(symbol, e)}
       on:keydown={(e) => e.key === 'Enter' && handleSelectSymbol(symbol, e)}
      >
       <span class="symbol-ticker">{symbol.ticker}</span>
       <span class="symbol-name">{symbol.shortName || symbol.name}</span>
      </div>
     {/each}
    {:else}
     <div class="no-results">{t('no_results')}</div>
    {/if}
   </div>
  {/if}
 </div>
</div>

<style>
 @import './symbolSelector.css';
</style>
