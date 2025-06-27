<script>
  import {
    selectedDrawingTool,
    isDrawingMode,
    magnetMode,
    overlays,
    selectedOverlay, chartInstance
  } from '../../stores/chartStore.js';
 import { drawingBarVisible } from '../../stores/settingsStore.js';
 import {
 selectDrawingTool,
 setMagnetMode,
 removeSelectedOverlay,
 clearAllOverlays,
 getDrawingToolGroups
 } from './drawing.js';
 import { t } from '../../utils/i18n.js';
  import {get} from "svelte/store";





 let activeGroup = 'single';
 let showToolDropdown = false;

 $: toolGroups = getDrawingToolGroups();
 $: currentTools = toolGroups[activeGroup] || [];
 $: console.log('Current tools for group', activeGroup, ':', currentTools);

 function handleGroupChange(group) {
 console.log('Changing group to:', group);
 activeGroup = group;
 showToolDropdown = false;
 }

 function handleToolSelect(tool) {
 console.log('Selecting tool:', tool);
 selectDrawingTool(tool);
 showToolDropdown = false;
 }

 function toggleDropdown() {
 console.log('Toggling dropdown, current state:', showToolDropdown);
 showToolDropdown = !showToolDropdown;
 }

 function getMagnetIcon() {
 switch ($magnetMode) {
 case 'weak_magnet': return '🧲';
 case 'strong_magnet': return '🧲🧲';
 default: return '⭕';
 }
 }

 function getMagnetTitle() {
 switch ($magnetMode) {
 case 'weak_magnet': return 'Weak Magnet (притягивание к ценам)';
 case 'strong_magnet': return 'Strong Magnet (сильное притягивание)';
 default: return 'No Magnet (свободное рисование)';
 }
 }















  // Замените функцию clearAllOverlaysFromChart на эту диагностическую версию

function clearAllOverlaysFromChart() {
 const chart = get(chartInstance);
 if (chart) {
 console.log('=== CHART DIAGNOSTIC ===');
 console.log('Chart object:', chart);
 console.log('Chart constructor:', chart.constructor.name);
 console.log('Chart prototype:', Object.getPrototypeOf(chart));

 // Получить все методы и свойства chart
 const methods = [];
 const properties = [];

 for (let obj = chart; obj !== null; obj = Object.getPrototypeOf(obj)) {
 Object.getOwnPropertyNames(obj).forEach(name => {
 if (name !== 'constructor') {
 try {
 if (typeof chart[name] === 'function') {
 methods.push(name);
 } else {
 properties.push(name);
 }
 } catch (e) {
 // Игнорируем ошибки доступа
 }
 }
 });
 }

 console.log('Available methods:', methods.sort());
 console.log('Available properties:', properties.sort());

 // Поиск overlay-связанных методов
 const overlayMethods = methods.filter(method =>
 method.toLowerCase().includes('overlay') ||
 method.toLowerCase().includes('remove') ||
 method.toLowerCase().includes('clear') ||
 method.toLowerCase().includes('delete')
 );
 console.log('Overlay-related methods:', overlayMethods);

 // Попробовать разные способы очистки
 const attempts = [
 () => chart.removeAllOverlays?.(),
 () => chart.clearAllOverlays?.(),
 () => chart.removeAllAnnotations?.(),
 () => chart.clearAnnotations?.(),
 () => chart.removeAllDrawings?.(),
 () => chart.clearDrawings?.(),
 () => chart.overlay?.clear?.(),
 () => chart.overlay?.removeAll?.(),
 () => chart.annotations?.clear?.(),
 () => chart.drawings?.clear?.(),
 () => {
 // Попробовать получить список overlays
 const overlays = chart.getAllOverlays?.() || chart.getOverlays?.() || [];
 console.log('Found overlays:', overlays);
 overlays.forEach(overlay => {
 try {
 chart.removeOverlay?.(overlay.id || overlay);
 } catch (e) {
 console.error('Failed to remove overlay:', e);
 }
 });
 return overlays.length;
 },
 () => {
 // Попробовать через chart._chart если это обертка
 if (chart._chart) {
 console.log('Found _chart property:', chart._chart);
 return chart._chart.removeAllOverlays?.() || chart._chart.clearAllOverlays?.();
 }
 },
 () => {
 // Попробовать через chart.chart если это обертка
 if (chart.chart) {
 console.log('Found chart property:', chart.chart);
 return chart.chart.removeAllOverlays?.() || chart.chart.clearAllOverlays?.();
 }
 },
 () => {
 // Последняя попытка - перерисовать chart
 if (chart.resize) {
 chart.resize();
 console.log('Chart resized - this might clear overlays');
 }
 }
 ];

 for (let i = 0; i < attempts.length; i++) {
 try {
 const result = attempts[i]();
 if (result !== undefined) {
 console.log(`Attempt ${i + 1} succeeded:`, result);
 break;
 }
 } catch (error) {
 console.log(`Attempt ${i + 1} failed:`, error.message);
 }
 }

 console.log('=== END DIAGNOSTIC ===');
 } else {
 console.error('Chart instance not available');
 }
}


</script>

{#if $drawingBarVisible}
 <div class="drawing-tools">
 <div class="tool-groups">
 <button
 class="group-btn"
 class:active={activeGroup === 'single'}
 on:click={() => handleGroupChange('single')}
 >
 Lines
 </button>
 <button
 class="group-btn"
 class:active={activeGroup === 'polygon'}
 on:click={() => handleGroupChange('polygon')}
 >
 Shapes
 </button>
 <button
 class="group-btn"
 class:active={activeGroup === 'fibonacci'}
 on:click={() => handleGroupChange('fibonacci')}
 >
 Fibonacci
 </button>
 <button
 class="group-btn"
 class:active={activeGroup === 'wave'}
 on:click={() => handleGroupChange('wave')}
 >
 Waves
 </button>
 </div>

 <div class="tool-selector">
 <button
 class="tool-button"
 class:active={showToolDropdown}
 on:click={toggleDropdown}
 >
 {$selectedDrawingTool ? t($selectedDrawingTool) : 'Select Tool'}
 <span class="dropdown-arrow">▼</span>
 </button>

 {#if showToolDropdown && currentTools.length > 0}
 <div class="tool-dropdown">
 {#each currentTools as tool}
 <button
 class="tool-item"
 class:active={$selectedDrawingTool === tool.key}
 on:click={() => handleToolSelect(tool.key)}
 >
 {tool.text}
 </button>
 {/each}
 </div>
 {:else if showToolDropdown}
 <div class="tool-dropdown">
 <div class="no-tools">No tools available for {activeGroup}</div>
 </div>
 {/if}
 </div>

 <div class="tool-controls">
 <button
 class="control-btn"
 class:active={$magnetMode !== 'none'}
 on:click={() => {
 const modes = ['none', 'weak_magnet', 'strong_magnet'];
 const currentIndex = modes.indexOf($magnetMode);
 const nextMode = modes[(currentIndex + 1) % modes.length];
 setMagnetMode(nextMode);
 }}
 title={getMagnetTitle()}
 >
 {getMagnetIcon()}
 </button>

 {#if $selectedOverlay}
 <button
 class="control-btn remove"
 on:click={removeSelectedOverlay}
 title="Remove Selected"
 >
 🗑️
 </button>
 {/if}



<!--<button class="toolbar-btn" on:click={clearAllOverlaysFromChart} title="Clear All Lines">-->
<!--🗑️ Clear-->
<!--</button>-->




     {#if $overlays.length > 0}
     <button
     class="control-btn clear"
     on:click={clearAllOverlays}
     title="Clear All"
     >
     ️🗑
     </button>
     {/if}



 </div>

 {#if $overlays.length > 0}
 <div class="overlay-list">
 <span class="overlay-count">{$overlays.length} overlays</span>
 </div>
 {/if}
 </div>
{/if}

<style>
 .drawing-tools {
 display: flex;
 align-items: center;
 gap: 16px;
 padding: 8px 16px;
 background-color: var(--chart-background-color, #ffffff);
 border-bottom: 1px solid var(--chart-border-color, #ebedf1);
 min-height: 40px;
 }

 .tool-groups {
 display: flex;
 gap: 4px;
 }

 .group-btn {
 padding: 4px 8px;
 border: 1px solid var(--chart-border-color, #ebedf1);
 border-radius: 4px;
 background-color: var(--chart-background-color, #ffffff);
 color: var(--chart-text-color, #051441);
 font-size: 12px;
 cursor: pointer;
 transition: all 0.2s;
 }

 .group-btn:hover {
 background-color: rgba(22, 119, 255, 0.1);
 }

 .group-btn.active {
 background-color: #1677ff;
 color: #ffffff;
 border-color: #1677ff;
 }

 .tool-selector {
 position: relative;
 min-width: 150px;
 }

 .tool-button {
 display: flex;
 align-items: center;
 justify-content: space-between;
 width: 100%;
 padding: 6px 12px;
 border: 1px solid var(--chart-border-color, #ebedf1);
 border-radius: 4px;
 background-color: var(--chart-background-color, #ffffff);
 color: var(--chart-text-color, #051441);
 font-size: 14px;
 cursor: pointer;
 transition: all 0.2s;
 }

 .tool-button:hover {
 background-color: rgba(22, 119, 255, 0.1);
 }

 .tool-button.active {
 border-color: #1677ff;
 }

 .dropdown-arrow {
 font-size: 10px;
 transition: transform 0.2s;
 }

 .tool-button.active .dropdown-arrow {
 transform: rotate(180deg);
 }

 .tool-dropdown {
 position: absolute;
 top: 100%;
 left: 0;
 right: 0;
 background-color: var(--chart-background-color, #ffffff);
 border: 1px solid var(--chart-border-color, #ebedf1);
 border-radius: 4px;
 box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
 max-height: 300px;
 overflow-y: auto;
 z-index: 1000;
 }

 .tool-item {
 display: block;
 width: 100%;
 padding: 8px 12px;
 border: none;
 background: none;
 color: var(--chart-text-color, #051441);
 font-size: 14px;
 text-align: left;
 cursor: pointer;
 border-bottom: 1px solid var(--chart-border-color, #ebedf1);
 transition: background-color 0.2s;
 }

 .tool-item:hover {
 background-color: rgba(22, 119, 255, 0.1);
 }

 .tool-item:last-child {
 border-bottom: none;
 }

 .tool-item.active {
 background-color: #1677ff;
 color: #ffffff;
 }

 .no-tools {
 padding: 8px 12px;
 color: #999;
 font-style: italic;
 text-align: center;
 }

 .tool-controls {
 display: flex;
 gap: 4px;
 }

 .control-btn {
 display: flex;
 align-items: center;
 justify-content: center;
 width: 32px;
 height: 32px;
 border: 1px solid var(--chart-border-color, #ebedf1);
 border-radius: 4px;
 background-color: var(--chart-background-color, #ffffff);
 color: var(--chart-text-color, #051441);
 font-size: 16px;
 cursor: pointer;
 transition: all 0.2s;
 }

 .control-btn:hover {
 background-color: rgba(22, 119, 255, 0.1);
 }

 .control-btn.active {
 background-color: #1677ff;
 color: #ffffff;
 border-color: #1677ff;
 }

 .control-btn.remove {
 border-color: #ff4d4f;
 color: #ff4d4f;
 }

 .control-btn.remove:hover {
 background-color: rgba(255, 77, 79, 0.1);
 }

 .control-btn.clear {
 border-color: #ff7875;
 color: #ff7875;
 }

 .control-btn.clear:hover {
 background-color: rgba(255, 120, 117, 0.1);
 }

 .overlay-list {
 display: flex;
 align-items: center;
 margin-left: auto;
 }

 .overlay-count {
 font-size: 12px;
 color: #76808f;
 padding: 4px 8px;
 background-color: rgba(22, 119, 255, 0.1);
 border-radius: 4px;
 }

 @media (max-width: 768px) {
 .drawing-tools {
 flex-wrap: wrap;
 gap: 8px;
 padding: 8px;
 }

 .tool-groups {
 order: 1;
 width: 100%;
 }

 .tool-selector {
 order: 2;
 min-width: 120px;
 }

 .tool-controls {
 order: 3;
 }

 .overlay-list {
 order: 4;
 margin-left: 0;
 }

 .group-btn {
 flex: 1;
 text-align: center;
 }
 }
</style>