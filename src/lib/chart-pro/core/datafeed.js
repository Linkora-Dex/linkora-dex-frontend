import { createSymbolInfo, createKLineData, SymbolType } from './types.js';
import { CONFIG, getApiUrl, getWsUrl, validateConfig } from '../utils/config.js';
import { chartStore } from '../stores/chartStore.js';

export class DefaultDatafeed {
 constructor() {
 if (!validateConfig()) {
 console.warn('Configuration validation failed, using defaults');
 }

 this.ws = null;
 this.currentSymbol = null;
 this.currentPeriod = null;
 this.lastCandle = null;
 this.connectionRetryCount = 0;
 this.lastDataReceived = Date.now();
 this.isConnecting = false;
 this.processedTimestamps = new Set();
 this.isSubscribing = false;
 this.reconnectionTimer = null;
 this.visibilityChangeHandler = null;
 this.onlineStatusHandler = null;

 // Улучшенные параметры для надежности
 this.heartbeatInterval = 30000; // 30 секунд
 this.heartbeatTimer = null;
 this.connectionTimeoutTimer = null;
 this.dataTimeoutTimer = null;
 this.maxDataTimeout = 120000; // 2 минуты без данных = переподключение
 this.maxRetries = Infinity; // Бесконечные попытки переподключения
 this.baseRetryDelay = 3000;
 this.maxRetryDelay = 30000;
 this.isManuallyDisconnected = false;
 this.lastNetworkStatus = true;

 this.initializeHealthMonitoring();
 this.setupVisibilityHandlers();
 this.setupNetworkHandlers();
 }

 initializeHealthMonitoring() {
 // Мониторинг поступления данных
 setInterval(() => {
 const timeSinceLastData = Date.now() - this.lastDataReceived;

 if (this.ws && this.ws.readyState === WebSocket.OPEN && timeSinceLastData > this.maxDataTimeout) {
 console.warn(`No data received for ${timeSinceLastData}ms, forcing reconnection`);
 this.forceReconnection();
 }

 // Логирование статуса каждую минуту
 console.log('WebSocket status:', {
 readyState: this.ws?.readyState,
 timeSinceLastData,
 connectionRetryCount: this.connectionRetryCount,
 symbol: this.currentSymbol?.ticker,
 isConnecting: this.isConnecting,
 isVisible: document.visibilityState === 'visible',
 isOnline: navigator.onLine
 });
 }, 60000); // Проверка каждую минуту
 }

 setupVisibilityHandlers() {
 if (typeof document !== 'undefined') {
 this.visibilityChangeHandler = () => {
 const isVisible = document.visibilityState === 'visible';
 console.log(`Visibility changed: ${isVisible ? 'visible' : 'hidden'}`);

 if (isVisible) {
 // Восстановление соединения при возвращении видимости
 console.log('Page became visible, checking connection');
 if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
 console.log('Reconnecting on visibility change');
 this.forceReconnection();
 } else {
 // Отправить пинг для проверки соединения
 try {
 this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
 } catch (error) {
 console.error('Error sending ping on visibility change:', error);
 this.forceReconnection();
 }
 }
 }
 };

 document.addEventListener('visibilitychange', this.visibilityChangeHandler);
 console.log('Visibility change handler set up');
 }
 }

 setupNetworkHandlers() {
 if (typeof window !== 'undefined') {
 this.onlineStatusHandler = () => {
 const isOnline = navigator.onLine;
 console.log(`Network status changed: ${isOnline ? 'online' : 'offline'}`);

 if (isOnline && !this.lastNetworkStatus) {
 // Восстановление после перехода в онлайн
 console.log('Network connectivity restored, reconnecting...');
 this.forceReconnection();
 }

 this.lastNetworkStatus = isOnline;
 };

 window.addEventListener('online', this.onlineStatusHandler);
 window.addEventListener('offline', this.onlineStatusHandler);
 console.log('Network status handlers set up');
 }
 }

 forceReconnection() {
 console.log('Force reconnection initiated');
 this.isManuallyDisconnected = false;

 // Очистка всех таймеров
 this.stopHeartbeat();
 this.stopDataTimeout();
 this.clearReconnectionTimer();

 // Проверяем подключение к интернету
 if (typeof navigator !== 'undefined' && !navigator.onLine) {
 console.log('Network is offline, waiting for online status before reconnecting');
 return; // Не пытаемся переподключиться, если нет сети
 }

 // Проверяем видимость страницы
 if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
 console.log('Page is not visible, will reconnect when visible');
 }

 if (this.ws) {
 try {
 this.ws.close(1000, 'Force reconnection');
 } catch (e) {
 console.warn('Error closing WebSocket:', e);
 }
 this.ws = null;
 }

 if (this.currentSymbol && this.currentPeriod && !this.isConnecting) {
 this.reconnectionTimer = setTimeout(() => {
 this.connectWebSocket(this.currentSymbol, this.lastCallback);
 }, 2000);
 }
 }

 clearReconnectionTimer() {
 if (this.reconnectionTimer) {
 clearTimeout(this.reconnectionTimer);
 this.reconnectionTimer = null;
 }
 }

 startHeartbeat() {
 this.stopHeartbeat();

 this.heartbeatTimer = setInterval(() => {
 if (this.ws && this.ws.readyState === WebSocket.OPEN) {
 try {
 this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
 console.log('Heartbeat ping sent');
 } catch (error) {
 console.error('Failed to send heartbeat:', error);
 this.forceReconnection();
 }
 }
 }, this.heartbeatInterval);
 }

 stopHeartbeat() {
 if (this.heartbeatTimer) {
 clearInterval(this.heartbeatTimer);
 this.heartbeatTimer = null;
 }
 }

 startDataTimeout() {
 this.stopDataTimeout();

 this.dataTimeoutTimer = setTimeout(() => {
 console.warn('Data timeout reached, forcing reconnection');
 this.forceReconnection();
 }, this.maxDataTimeout);
 }

 stopDataTimeout() {
 if (this.dataTimeoutTimer) {
 clearTimeout(this.dataTimeoutTimer);
 this.dataTimeoutTimer = null;
 }
 }

 async searchSymbols(search = '') {
 console.log('searchSymbols called with search:', search);
 try {
 const response = await fetch(getApiUrl('/symbols'));

 if (!response.ok) {
 throw new Error(`HTTP ${response.status}: ${response.statusText}`);
 }

 const data = await response.json();
 console.log('Fetched symbols:', data);

 const symbols = data.symbols.map(ticker => createSymbolInfo(ticker, {
 name: this.formatSymbolName(ticker),
 shortName: ticker,
 exchange: CONFIG.DEFAULT_EXCHANGE,
 market: 'crypto',
 type: SymbolType.CRYPTO,
 priceCurrency: this.extractQuoteCurrency(ticker)
 }));

 const filtered = search
 ? symbols.filter(symbol =>
 symbol.ticker.toLowerCase().includes(search.toLowerCase()) ||
 symbol.name.toLowerCase().includes(search.toLowerCase())
 )
 : symbols;

 console.log('Filtered symbols:', filtered.length);
 return filtered;
 } catch (error) {
 console.error('Error fetching symbols:', error);
 return [];
 }
 }

 async getHistoryKLineData(symbol, period, from, to) {
 try {
 const timeframe = this.convertPeriodToTimeframe(period);
 console.log('Converted period to timeframe:', timeframe);

 const params = new URLSearchParams({
 symbol: symbol.ticker,
 timeframe: timeframe,
 limit: CONFIG.DEFAULT_LIMIT.toString()
 });

 if (from) {
 params.append('start_date', new Date(from).toISOString());
 }

 const url = getApiUrl(`/candles?${params.toString()}`);
 console.log('Fetching historical data from:', url);

 const response = await fetch(url);

 if (!response.ok) {
 throw new Error(`HTTP ${response.status}: ${response.statusText}`);
 }

 const data = await response.json();

 if (data.error) {
 throw new Error(`API Error: ${data.error}`);
 }

 console.log('Fetched historical data:', data.length, 'candles');

 const klineData = data.map(candle => createKLineData(
 candle.timestamp,
 parseFloat(candle.open_price),
 parseFloat(candle.high_price),
 parseFloat(candle.low_price),
 parseFloat(candle.close_price),
 parseFloat(candle.volume)
 ));

 if (klineData.length > 0) {
 const latestCandle = klineData[klineData.length - 1];
 console.log('Setting initial price from latest historical candle:', latestCandle.close);
 chartStore.updatePrice(latestCandle.close);
 }

 return klineData;
 } catch (error) {
 console.error('Error loading historical data:', error);
 if (error.name === 'TypeError' && error.message.includes('fetch')) {
 console.warn('Backend not available, returning empty data');
 return [];
 }
 throw error;
 }
 }

 async subscribe(symbol, period, callback) {
 console.log('subscribe called with:', {
 symbol: symbol?.ticker,
 period: { multiplier: period?.multiplier, timespan: period?.timespan },
 currentSymbol: this.currentSymbol?.ticker,
 currentPeriod: { multiplier: this.currentPeriod?.multiplier, timespan: this.currentPeriod?.timespan }
 });

 if (this.isSubscribing) {
 console.log('Already subscribing, skipping duplicate request');
 return;
 }

 if (this.currentSymbol?.ticker === symbol.ticker &&
 this.currentPeriod?.multiplier === period.multiplier &&
 this.currentPeriod?.timespan === period.timespan &&
 this.ws && this.ws.readyState === WebSocket.OPEN) {
 console.log('Symbol/period unchanged and WebSocket active, skipping re-subscribe');
 return;
 }

 this.isSubscribing = true;
 this.lastCallback = callback; // Сохранить callback для переподключений
 console.log('New subscription needed, updating symbol/period');

 this.isManuallyDisconnected = false;

 if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
 console.log('Closing existing WebSocket connection');
 this.ws.close(1000, 'Changing subscription');
 this.ws = null;
 }

 this.currentSymbol = symbol;
 this.currentPeriod = period;
 this.processedTimestamps.clear();
 this.lastCandle = null;

 try {
 if (!this.isConnecting) {
 await this.connectWebSocket(symbol, callback);
 }
 } catch (error) {
 console.error('Error in subscription:', error);
 } finally {
 this.isSubscribing = false;
 }
 }

 async connectWebSocket(symbol, callback) {
 // Проверяем подключение к интернету
 if (typeof navigator !== 'undefined' && !navigator.onLine) {
 console.log('Network is offline, cannot connect');
 this.scheduleReconnection(callback);
 return;
 }

 // Проверяем, не находимся ли мы уже в процессе подключения
 if (this.isConnecting) {
 console.log('Already connecting, skipping duplicate connection attempt');
 return;
 }

 const timeframe = this.convertPeriodToTimeframe(this.currentPeriod);
 const wsUrl = getWsUrl(`?symbol=${symbol.ticker}&timeframe=${timeframe}`);
 console.log(`Connecting to WebSocket: ${wsUrl} (timeframe: ${timeframe}) - Attempt ${this.connectionRetryCount + 1}`);

 this.isConnecting = true;

 try {
 // Устанавливаем новое соединение WebSocket
 this.ws = new WebSocket(wsUrl);

 // Устанавливаем таймаут на установку соединения
 this.connectionTimeoutTimer = setTimeout(() => {
 if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
 console.log('WebSocket connection timeout');
 try {
 this.ws.close();
 } catch (e) {
 console.warn('Error closing timed out connection:', e);
 }
 this.ws = null;
 this.isConnecting = false;
 this.scheduleReconnection(callback);
 }
 }, CONFIG.CONNECTION_TIMEOUT || 10000);

 this.ws.onopen = () => {
 console.log('✅ WebSocket connection opened successfully');
 clearTimeout(this.connectionTimeoutTimer);
 this.lastDataReceived = Date.now();
 this.connectionRetryCount = 0;
 this.isConnecting = false;

 // Запустить мониторинг
 this.startHeartbeat();
 this.startDataTimeout();

 console.log(`WebSocket ready for ${symbol.ticker} timeframe: ${timeframe}`);
 };

 this.ws.onmessage = (event) => {
 this.lastDataReceived = Date.now();
 this.stopDataTimeout();
 this.startDataTimeout(); // Перезапустить таймер

 try {
 const message = JSON.parse(event.data);

 if (message.type === 'heartbeat' || message.type === 'pong') {
 console.log('📡 Received heartbeat/pong from server');
 return;
 }

 console.log('📈 WebSocket data received:', {
 symbol: message.symbol,
 timestamp: message.timestamp,
 close: message.close,
 timeframe: timeframe
 });

 if (message.symbol === symbol.ticker && !this.isConnecting) {
 const timestampKey = `${message.symbol}-${message.timestamp}`;

 if (this.lastCandle &&
     this.lastCandle.timestamp === message.timestamp &&
     this.lastCandle.close === parseFloat(message.close)) {
 console.log('Identical candle data detected, skipping:', timestampKey);
 return;
 }

 console.log(`Processing aggregated ${timeframe} candle data for symbol: ${symbol.ticker}`);

 const klineData = createKLineData(
 message.timestamp,
 parseFloat(message.open),
 parseFloat(message.high),
 parseFloat(message.low),
 parseFloat(message.close),
 parseFloat(message.volume)
 );

 console.log('💰 Updating price in chartStore:', parseFloat(message.close));
 chartStore.updatePrice(parseFloat(message.close));

 this.lastCandle = { ...klineData };
 this.connectionRetryCount = 0;
 callback(this.lastCandle);
 } else if (message.symbol !== symbol.ticker) {
 console.log('Received data for different symbol:', message.symbol, 'expected:', symbol.ticker);
 }
 } catch (error) {
 console.error('Error parsing WebSocket message:', error, 'Raw data:', event.data);
 }
 };

 this.ws.onclose = (event) => {
 clearTimeout(this.connectionTimeoutTimer);
 this.isConnecting = false;
 this.stopHeartbeat();
 this.stopDataTimeout();

 console.log(`🔌 WebSocket closed. Code: ${event.code}, Reason: '${event.reason}', Clean: ${event.wasClean}`);

 if (this.isManuallyDisconnected || event.code === 1000) {
 console.log('WebSocket closed intentionally, not reconnecting');
 return;
 }

 this.scheduleReconnection(callback);
 };

 this.ws.onerror = (error) => {
 console.error('❌ WebSocket error:', error);
 this.isConnecting = false;
 };
 } catch (error) {
 console.error('Failed to create WebSocket connection:', error);
 this.isConnecting = false;
 this.scheduleReconnection(callback);
 }
 }

 scheduleReconnection(callback) {
 if (this.isManuallyDisconnected) {
 console.log('Manual disconnection, not scheduling reconnection');
 return;
 }

 // Очищаем предыдущий таймер переподключения
 this.clearReconnectionTimer();

 // Проверяем подключение к интернету
 if (typeof navigator !== 'undefined' && !navigator.onLine) {
 console.log('Network is offline, waiting for online status before reconnecting');
 return; // Вернемся когда сеть будет доступна через обработчик online
 }

 // Если у нас есть символ и мы не в процессе подключения
 if (this.currentSymbol && !this.isConnecting) {
 this.connectionRetryCount++;

 // Расчет времени задержки с ограничением максимума
 // Но если счетчик попыток большой, используем постоянную задержку
 let retryDelay;
 if (this.connectionRetryCount <= 10) {
 retryDelay = Math.min(
 this.baseRetryDelay * Math.pow(1.5, Math.min(this.connectionRetryCount - 1, 8)),
 this.maxRetryDelay
 );
 } else {
 retryDelay = this.maxRetryDelay;
 }

 console.log(`🔄 Reconnecting in ${retryDelay}ms... (attempt ${this.connectionRetryCount})`);

 this.reconnectionTimer = setTimeout(() => {
 // Повторная проверка условий перед повторным подключением
 if (this.currentSymbol && this.currentPeriod && !this.isConnecting && !this.isManuallyDisconnected) {
 // Проверка видимости и сетевого соединения
 const isVisible = typeof document === 'undefined' || document.visibilityState === 'visible';
 const isOnline = typeof navigator === 'undefined' || navigator.onLine;

 if (isOnline) {
 this.connectWebSocket(this.currentSymbol, callback);
 } else {
 console.log('Still offline, waiting for network restoration');
 this.scheduleReconnection(callback); // Планируем новую попытку
 }
 }
 }, retryDelay);
 } else {
 console.warn('Cannot schedule reconnection: no symbol or already connecting');
 }
 }

 unsubscribe(symbol, period) {
 console.log('🛑 unsubscribe called:', { symbol, period });

 this.isManuallyDisconnected = true;
 this.stopHeartbeat();
 this.stopDataTimeout();
 this.clearReconnectionTimer();

 if (this.ws) {
 console.log('Closing WebSocket connection');
 try {
 this.ws.close(1000, 'Unsubscribing');
 } catch (e) {
 console.warn('Error closing WebSocket:', e);
 }
 this.ws = null;
 }

 this.lastCandle = null;
 this.connectionRetryCount = 0;

 // Удаляем обработчики событий при отписке
 this.removeEventHandlers();
 }

 removeEventHandlers() {
 // Удаляем обработчик изменения видимости
 if (this.visibilityChangeHandler && typeof document !== 'undefined') {
 document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
 this.visibilityChangeHandler = null;
 }

 // Удаляем обработчики сетевого статуса
 if (this.onlineStatusHandler && typeof window !== 'undefined') {
 window.removeEventListener('online', this.onlineStatusHandler);
 window.removeEventListener('offline', this.onlineStatusHandler);
 this.onlineStatusHandler = null;
 }
 this.currentSymbol = null;
 this.currentPeriod = null;
 this.isConnecting = false;
 this.isSubscribing = false;
 this.processedTimestamps.clear();
 this.lastCallback = null;
 }

 // Метод для получения статуса соединения
 getConnectionStatus() {
 return {
 connected: this.ws?.readyState === WebSocket.OPEN,
 readyState: this.ws?.readyState || WebSocket.CLOSED,
 connectionRetryCount: this.connectionRetryCount,
 currentSymbol: this.currentSymbol?.ticker,
 currentTimeframe: this.convertPeriodToTimeframe(this.currentPeriod),
 lastDataReceived: this.lastDataReceived,
 timeSinceLastData: Date.now() - this.lastDataReceived,
 isConnecting: this.isConnecting
 };
 }

 convertPeriodToTimeframe(period) {
 if (!period || typeof period !== 'object') {
 console.error('Invalid period object:', period);
 return '1';
 }

 const { multiplier, timespan } = period;

 if (!multiplier || !timespan) {
 console.error('Missing multiplier or timespan in period:', period);
 return '1';
 }

 const timespanMap = {
 minute: multiplier === 1 ? '1' : multiplier === 3 ? '3' : multiplier === 5 ? '5' :
 multiplier === 15 ? '15' : multiplier === 30 ? '30' : multiplier === 45 ? '45' : '1',
 hour: multiplier === 1 ? '1H' : multiplier === 2 ? '2H' : multiplier === 3 ? '3H' :
 multiplier === 4 ? '4H' : '1H',
 day: '1D',
 week: '1W',
 month: '1M'
 };

 const result = timespanMap[timespan] || '1';
 return result;
 }

 formatSymbolName(ticker) {
 if (ticker.includes('USDT')) {
 return ticker.replace('USDT', ' / USDT');
 }
 if (ticker.includes('BTC')) {
 return ticker.replace('BTC', ' / BTC');
 }
 if (ticker.includes('ETH')) {
 return ticker.replace('ETH', ' / ETH');
 }
 return ticker;
 }

 extractQuoteCurrency(ticker) {
 if (ticker.includes('USDT')) return 'USDT';
 if (ticker.includes('BTC')) return 'BTC';
 if (ticker.includes('ETH')) return 'ETH';
 return 'USDT';
 }

 async checkHealth() {
 try {
 const response = await fetch(getApiUrl('/health'));
 const data = await response.json();
 console.log('Backend health status:', data);
 return data.status === 'healthy';
 } catch (error) {
 console.error('Backend health check failed:', error);
 return false;
 }
 }
}