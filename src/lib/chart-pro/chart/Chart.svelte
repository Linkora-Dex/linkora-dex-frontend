<script>
 import { onMount, onDestroy } from 'svelte';
 import { initChart, destroyChart, updateChartSymbol, updateChartPeriod, updateChartTheme, updateChartStyles } from './chart.js';
 import {
 currentSymbol,
 currentPeriod,
 setChartInstance
 } from '../stores/chartStore.js';
 import {
 theme,
 chartStyles,
 timezone
 } from '../stores/settingsStore.js';

 export let datafeed = null;

 let chartContainer;
 let chart = null;
 let unsubscribeSymbol;
 let unsubscribePeriod;
 let unsubscribeTheme;
 let unsubscribeStyles;
 let isInitialized = false;

 onMount(async () => {
 if (chartContainer && datafeed && !isInitialized) {
 isInitialized = true;

 chart = await initChart(chartContainer, {
 symbol: $currentSymbol,
 period: $currentPeriod,
 theme: $theme,
 styles: $chartStyles,
 timezone: $timezone,
 datafeed
 });

 if (chart) {
 setChartInstance(chart);

 unsubscribeSymbol = currentSymbol.subscribe(symbol => {
 if (chart && symbol && isInitialized) {
 updateChartSymbol(chart, symbol, datafeed);
 }
 });

 unsubscribePeriod = currentPeriod.subscribe(period => {
 if (chart && period && isInitialized) {
 updateChartPeriod(chart, period, datafeed);
 }
 });

 unsubscribeTheme = theme.subscribe(newTheme => {
 if (chart && newTheme && isInitialized) {
 updateChartTheme(chart, newTheme);
 }
 });

 unsubscribeStyles = chartStyles.subscribe(styles => {
 if (chart && styles && isInitialized) {
 updateChartStyles(chart, styles);
 }
 });
 }
 }
 });

 onDestroy(() => {
 isInitialized = false;

 if (unsubscribeSymbol) unsubscribeSymbol();
 if (unsubscribePeriod) unsubscribePeriod();
 if (unsubscribeTheme) unsubscribeTheme();
 if (unsubscribeStyles) unsubscribeStyles();

 if (chart) {
 destroyChart(chart);
 setChartInstance(null);
 }
 });
</script>

<div class="chart-container" bind:this={chartContainer}></div>