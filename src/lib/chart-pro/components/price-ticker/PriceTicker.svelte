<script>
 import { onMount, onDestroy } from 'svelte';
 import { currentSymbol, currentPeriod } from '../../stores/chartStore.js';
 import { formatPrice, calculatePriceChange, formatChange, formatPercentage, getDirectionIcon } from './priceTicker.js';
 import { PriceService } from './priceService.js';

 let priceService = new PriceService();
 let flashClass = '';
 let previousDirection = 'neutral';

 let currentPrice = null;
 let previousPrice = null;
 let priceData = {
 current_price: '0.00000000',
 previous_price: '0.00000000',
 change_absolute: '0.00000000',
 change_percent: '0.00',
 trend: 'neutral',
 volume: '0.00000000'
 };

 $: symbol = $currentSymbol;
 $: period = $currentPeriod;

 $: priceChange = {
 absolute: parseFloat(priceData.change_absolute || 0),
 percentage: parseFloat(priceData.change_percent || 0),
 direction: priceData.trend || 'neutral'
 };

 $: formattedPrice = formatPrice(priceData.current_price, symbol?.pricePrecision || 8);
 $: formattedAbsolute = formatChange(priceChange.absolute, symbol?.pricePrecision || 8);
 $: formattedPercentage = formatPercentage(priceChange.percentage);
 $: directionIcon = getDirectionIcon(priceChange.direction);

 $: {
 if (priceChange.direction !== previousDirection && priceChange.direction !== 'neutral') {
 flashClass = priceChange.direction === 'up' ? 'flash-up' : 'flash-down';
 setTimeout(() => flashClass = '', 300);
 previousDirection = priceChange.direction;
 }
 }

 // Слежение за изменениями символа или периода
 $: if (symbol?.ticker && period) {
  console.log('PriceTicker: Symbol or period changed, restarting price service');
  startPriceService();
 }

 function convertPeriodToTimeframe(period) {
 if (!period) return '5';

 const { multiplier, timespan } = period;

 const timespanMap = {
 minute: multiplier === 1 ? '1' : multiplier === 3 ? '3' : multiplier === 5 ? '5' :
 multiplier === 15 ? '15' : multiplier === 30 ? '30' : multiplier === 45 ? '45' : '5',
 hour: multiplier === 1 ? '1H' : multiplier === 2 ? '2H' : multiplier === 3 ? '3H' :
 multiplier === 4 ? '4H' : '1H',
 day: '1D',
 week: '1W',
 month: '1M'
 };

 return timespanMap[timespan] || '5';
 }

 function handlePriceUpdate(data) {
 console.log('Price ticker update:', data);
 priceData = data;
 }

 function startPriceService() {
 if (!symbol?.ticker || !period) return;

 const timeframe = convertPeriodToTimeframe(period);
 console.log('Starting price service:', symbol.ticker, timeframe);
 priceService.start(symbol.ticker, timeframe, handlePriceUpdate);
 }

 onMount(() => {
 console.log('PriceTicker mounted');
 if (symbol?.ticker && period) {
 startPriceService();
 }
 });

 onDestroy(() => {
 console.log('PriceTicker destroyed');
 priceService.stop();
 });
</script>

<div class="price-ticker {flashClass}">
 <div class="price-main">
 <span class="price-value">{formattedPrice}</span>
 <span class="price-direction {priceChange.direction}">{directionIcon}</span>
 </div>

 <div class="price-change {priceChange.direction}">
 <span class="price-change-absolute">{formattedAbsolute}</span>
 <span class="price-change-percentage">{formattedPercentage}</span>
 </div>
</div>

<style>
 @import './priceTicker.css';
</style>