import {writable, derived, get} from 'svelte/store';
import {createSymbolInfo, createPeriod, SymbolType, PeriodTimespan} from '../core/types.js';
import {CONFIG} from '../utils/config.js';

export const chartInstance = writable(null);
export const isChartReady = writable(false);

export const currentSymbol = writable(createSymbolInfo('BTCUSDT', {
 name: 'Bitcoin / Tether',
 shortName: 'BTCUSDT',
 exchange: CONFIG.DEFAULT_EXCHANGE,
 market: 'crypto',
 type: SymbolType.CRYPTO,
 priceCurrency: 'USDT'
}));

export const currentPeriod = writable(createPeriod(15, PeriodTimespan.MINUTE, '15m'));

export const availablePeriods = writable([
 createPeriod(1, PeriodTimespan.MINUTE, '1m'),
 createPeriod(3, PeriodTimespan.MINUTE, '3m'),
 createPeriod(5, PeriodTimespan.MINUTE, '5m'),
 createPeriod(15, PeriodTimespan.MINUTE, '15m'),
 createPeriod(30, PeriodTimespan.MINUTE, '30m'),
 createPeriod(45, PeriodTimespan.MINUTE, '45m'),
 createPeriod(1, PeriodTimespan.HOUR, '1H'),
 createPeriod(2, PeriodTimespan.HOUR, '2H'),
 createPeriod(3, PeriodTimespan.HOUR, '3H'),
 createPeriod(4, PeriodTimespan.HOUR, '4H'),
 createPeriod(1, PeriodTimespan.DAY, '1D'),
 createPeriod(1, PeriodTimespan.WEEK, '1W'),
 createPeriod(1, PeriodTimespan.MONTH, '1M')
]);

export const symbols = writable([]);
export const isLoadingSymbols = writable(false);
export const searchQuery = writable('');

export const filteredSymbols = derived(
 [symbols, searchQuery],
 ([$symbols, $searchQuery]) => {
 if (!$searchQuery) return $symbols;
 const query = $searchQuery.toLowerCase();
 return $symbols.filter(symbol =>
 symbol.ticker.toLowerCase().includes(query) ||
 symbol.name.toLowerCase().includes(query) ||
 symbol.shortName.toLowerCase().includes(query)
 );
 }
);

export const selectedDrawingTool = writable(null);
export const isDrawingMode = writable(false);
export const magnetMode = writable('none');

export const mainIndicators = writable(['MA']);
export const subIndicators = writable(['VOL']);

export const overlays = writable([]);
export const selectedOverlay = writable(null);

export const chartData = writable([]);
export const isLoadingData = writable(false);
export const dataError = writable(null);

// Создаем отдельный store для доступных символов
const symbolsStore = writable([]);
export const availableSymbols = symbolsStore;

export function setChartInstance(instance) {
 console.log('Setting chart instance:', instance);
 chartInstance.set(instance);
 isChartReady.set(!!instance);
}

export function updateSymbol(symbol) {
 console.log('Updating symbol:', symbol);
 currentSymbol.set(symbol);
 dataError.set(null);
}

export function updatePeriod(period) {
 console.log('Updating period:', period);
 currentPeriod.set(period);
 dataError.set(null);
}

export function setSymbols(symbolList) {
 console.log('Setting symbols:', symbolList.length);
 symbols.set(symbolList);
 // Синхронизируем с availableSymbols
 symbolsStore.set(symbolList);
}

export function setLoadingSymbols(loading) {
 isLoadingSymbols.set(loading);
}

export function setSearchQuery(query) {
 searchQuery.set(query);
}

export function setDrawingTool(tool) {
 console.log('Setting drawing tool:', tool);
 selectedDrawingTool.set(tool);
 isDrawingMode.set(!!tool);
}

export function setMagnetMode(mode) {
 console.log('Setting magnet mode:', mode);
 magnetMode.set(mode);
}

export function addMainIndicator(indicator) {
 mainIndicators.update(indicators => {
 if (!indicators.includes(indicator)) {
 console.log('Adding main indicator:', indicator);
 return [...indicators, indicator];
 }
 return indicators;
 });
}

export function removeMainIndicator(indicator) {
 mainIndicators.update(indicators => {
 console.log('Removing main indicator:', indicator);
 return indicators.filter(i => i !== indicator);
 });
}

export function addSubIndicator(indicator) {
 subIndicators.update(indicators => {
 if (!indicators.includes(indicator)) {
 console.log('Adding sub indicator:', indicator);
 return [...indicators, indicator];
 }
 return indicators;
 });
}

export function removeSubIndicator(indicator) {
 subIndicators.update(indicators => {
 console.log('Removing sub indicator:', indicator);
 return indicators.filter(i => i !== indicator);
 });
}

export function addOverlay(overlay) {
 overlays.update(overlayList => {
 console.log('Adding overlay:', overlay);
 return [...overlayList, overlay];
 });
}

export function removeOverlay(overlayId) {
 overlays.update(overlayList => {
 console.log('Removing overlay:', overlayId);
 return overlayList.filter(o => o.id !== overlayId);
 });
}

export function selectOverlay(overlay) {
 selectedOverlay.set(overlay);
}

export function setChartData(data) {
 chartData.set(data);
}

export function setLoadingData(loading) {
 isLoadingData.set(loading);
}

export function setDataError(error) {
 if (error) {
 console.error('Chart data error:', error);
 } else {
 console.log('Chart error cleared');
 }
 dataError.set(error);
}

// Функция для загрузки доступных символов
export async function loadSymbols() {
  console.log('Loading symbols...');
  setLoadingSymbols(true);

  try {
    // Используем DefaultDatafeed для запроса символов с API
    const { DefaultDatafeed } = await import('../core/datafeed.js');
    const datafeed = new DefaultDatafeed();
    const symbolList = await datafeed.searchSymbols('');

    // Обновляем оба store: symbols и availableSymbols
    setSymbols(symbolList);
    symbolsStore.set(symbolList);
    console.log(`Loaded ${symbolList.length} symbols:`, symbolList.map(s => s.ticker).join(', '));
    return symbolList;
  } catch (error) {
    console.error('Failed to load symbols:', error);
    setDataError(error.message);
    return [];
  } finally {
    setLoadingSymbols(false);
  }
}

// Функция поиска символов
export async function searchSymbols(query) {
  console.log('Searching symbols:', query);

  try {
    // Здесь можно использовать API для поиска символов
    // В данном случае просто фильтруем из уже загруженных
    const symbols = get(symbolsStore);
    if (!query) return symbols;

    const filteredSymbols = symbols.filter(symbol => 
      symbol.ticker.toLowerCase().includes(query.toLowerCase()) ||
      symbol.name?.toLowerCase().includes(query.toLowerCase()) ||
      symbol.shortName?.toLowerCase().includes(query.toLowerCase())
    );

    return filteredSymbols;
  } catch (error) {
    console.error('Error searching symbols:', error);
    return [];
  }
}

function createChartStore() {
 const { subscribe, set, update } = writable({
 symbol: null,
 period: '1',
 chart: null,
 isLoading: false,
 error: null,
 isConnected: false,
 currentPrice: null,
 previousPrice: null,
 lastUpdateTime: null
 });

 return {
 subscribe,
 setSymbol: (symbol) => update(state => ({ ...state, symbol })),
 setPeriod: (period) => update(state => ({ ...state, period })),
 setChart: (chart) => update(state => ({ ...state, chart })),
 setLoading: (isLoading) => update(state => ({ ...state, isLoading })),
 setError: (error) => update(state => ({ ...state, error })),
 setConnected: (isConnected) => update(state => ({ ...state, isConnected })),
 updatePrice: (newPrice) => update(state => ({
 ...state,
 previousPrice: state.currentPrice,
 currentPrice: newPrice,
 lastUpdateTime: Date.now()
 })),
 reset: () => set({
 symbol: null,
 period: '1',
 chart: null,
 isLoading: false,
 error: null,
 isConnected: false,
 currentPrice: null,
 previousPrice: null,
 lastUpdateTime: null
 })
 };
}

export const chartStore = createChartStore();