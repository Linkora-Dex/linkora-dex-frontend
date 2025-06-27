<script>
 import {
 currentSymbol,
 currentPeriod,
 availablePeriods,
 updatePeriod,
 chartInstance
 } from '../../stores/chartStore.js';
 import {
 theme,
 setTheme,
 openModal,
 toggleDrawingBar,
 setFullscreen,
 fullscreen
 } from '../../stores/settingsStore.js';
 import { get } from 'svelte/store';
 import { handlePeriodChange, toggleTheme, takeScreenshot } from './toolbar.js';
 import { clearAllOverlays } from '../drawing-tools/drawing.js';
 import PriceTicker from '../price-ticker/PriceTicker.svelte';
 import SymbolSelector from '../symbol-selector/SymbolSelector.svelte';
 import { t } from '../../utils/i18n.js';

 let showPeriodDropdown = false;

 function selectPeriod(period) {
 handlePeriodChange(period);
 showPeriodDropdown = false;
 }

 function handleFullscreen() {
 const newFullscreen = !$fullscreen;
 setFullscreen(newFullscreen);

 if (newFullscreen) {
 document.documentElement.requestFullscreen?.();
 } else {
 document.exitFullscreen?.();
 }
 }
</script>

<div class="toolbar">
 <div class="toolbar-section">
 <SymbolSelector />

 <PriceTicker />

 <div class="period-selector">
 <button
 class="period-button"
 on:click={() => showPeriodDropdown = !showPeriodDropdown}
 >
 {$currentPeriod.text}
 <span class="dropdown-arrow">▼</span>
 </button>
 {#if showPeriodDropdown}
 <div class="period-dropdown">
 {#each $availablePeriods as period}
 <button
 class="period-item"
 class:active={period.text === $currentPeriod.text}
 on:click={() => selectPeriod(period)}
 >
 {period.text}
 </button>
 {/each}
 </div>
 {/if}
 </div>
 </div>

 <div class="toolbar-section">
 <button class="toolbar-btn" on:click={() => openModal('indicators')} title={t('indicator')}>
 {t('indicator')}
 </button>

 <button class="toolbar-btn" on:click={toggleDrawingBar} title="Toggle Drawing Tools">
 Drawing
 </button>

 <button class="toolbar-btn" on:click={toggleTheme} title={$theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}>
 {$theme === 'light' ? '🌙' : '☀️'}
 </button>

 <button class="toolbar-btn" on:click={() => openModal('settings')} title={t('setting')}>
 {t('setting')}
 </button>

 <button class="toolbar-btn" on:click={() => openModal('timezone')} title={t('timezone')}>
 {t('timezone')}
 </button>

 <button class="toolbar-btn" on:click={takeScreenshot} title={t('screenshot')}>
 {t('screenshot')}
 </button>

 <button class="toolbar-btn" on:click={handleFullscreen} title={$fullscreen ? t('exit_full_screen') : t('full_screen')}>
 {$fullscreen ? t('exit_full_screen') : t('full_screen')}
 </button>

 <button class="toolbar-btn" on:click={clearAllOverlays} title="Clear All Lines">
 🗑️ Clear
 </button>
 </div>
</div>