import { getApiUrl } from '../../utils/config.js';

export class PriceService {
 constructor() {
 this.intervalId = null;
 this.currentSymbol = null;
 this.currentTimeframe = null;
 this.callback = null;
 this.isRunning = false;
 this.isStarting = false;
 this.lastSuccessfulUpdate = Date.now();
 this.offlineRetryCount = 0;
 this.visibilityChangeHandler = null;
 this.onlineStatusHandler = null;

 this.setupVisibilityHandlers();
 this.setupNetworkHandlers();
 }

 setupVisibilityHandlers() {
 if (typeof document !== 'undefined') {
 this.visibilityChangeHandler = () => {
 const isVisible = document.visibilityState === 'visible';
 console.log(`PriceService: Visibility changed: ${isVisible ? 'visible' : 'hidden'}`);

 if (isVisible && this.isRunning) {
 console.log('PriceService: Page became visible, updating price immediately');
 this.fetchAndUpdate();
 }
 };

 document.addEventListener('visibilitychange', this.visibilityChangeHandler);
 }
 }

 setupNetworkHandlers() {
 if (typeof window !== 'undefined') {
 this.onlineStatusHandler = () => {
 const isOnline = navigator.onLine;
 console.log(`PriceService: Network status changed: ${isOnline ? 'online' : 'offline'}`);

 if (isOnline && this.isRunning) {
 console.log('PriceService: Network connectivity restored, updating price immediately');
 this.fetchAndUpdate();
 }
 };

 window.addEventListener('online', this.onlineStatusHandler);
 window.addEventListener('offline', this.onlineStatusHandler);
 }
 }

 async fetchPrice(symbol, timeframe) {
 try {
 const url = getApiUrl(`/price?symbol=${symbol}&timeframe=${timeframe}`);
 const response = await fetch(url);

 if (!response.ok) {
 throw new Error(`HTTP ${response.status}: ${response.statusText}`);
 }

 const data = await response.json();
 console.log('Price data received:', data);
 return data;
 } catch (error) {
 console.error('Error fetching price:', error);
 throw error;
 }
 }

 start(symbol, timeframe, callback) {
 console.log('Starting price service for:', symbol, timeframe);

 if (this.isStarting) {
 console.log('Price service is already starting, skipping');
 return;
 }

 if (this.isRunning && this.currentSymbol === symbol && this.currentTimeframe === timeframe) {
 console.log('Price service already running for this symbol/timeframe');
 return;
 }

 this.isStarting = true;
 this.stop();

 this.currentSymbol = symbol;
 this.currentTimeframe = timeframe;
 this.callback = callback;
 this.isRunning = true;
 this.isStarting = false;

 this.fetchAndUpdate();
 this.intervalId = setInterval(() => {
 if (this.isRunning) {
 this.fetchAndUpdate();
 }
 }, 5000);
 }

 async fetchAndUpdate() {
 if (!this.callback || !this.currentSymbol || !this.currentTimeframe) return;

 // Проверяем подключение к интернету
 if (typeof navigator !== 'undefined' && !navigator.onLine) {
 console.log('PriceService: Network is offline, skipping price update');
 return;
 }

 // Проверяем видимость страницы
 if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
 console.log('PriceService: Page is not visible, might skip update depending on time passed');

 // Если страница неактивна уже долго, можно пропустить обновление
 const timeSinceLastUpdate = Date.now() - this.lastSuccessfulUpdate;
 if (timeSinceLastUpdate < 60000) { // Менее минуты
 console.log('PriceService: Recently updated, skipping update while page hidden');
 return;
 }
 }

 try {
 const priceData = await this.fetchPrice(this.currentSymbol, this.currentTimeframe);
 this.callback(priceData);
 this.lastSuccessfulUpdate = Date.now();
 this.offlineRetryCount = 0; // Сбрасываем счетчик после успешного обновления
 } catch (error) {
 console.error('Error updating price:', error);

 // Если ошибка связана с сетью, увеличиваем счетчик
 if (error.name === 'TypeError' && error.message.includes('fetch')) {
 this.offlineRetryCount++;
 console.log(`PriceService: Network error, retry count: ${this.offlineRetryCount}`);

 // Если много ошибок подряд, увеличиваем интервал обновления
 if (this.offlineRetryCount > 5 && this.intervalId) {
 clearInterval(this.intervalId);
 const newInterval = Math.min(5000 * Math.pow(1.5, Math.min(this.offlineRetryCount - 5, 5)), 30000);
 console.log(`PriceService: Increasing update interval to ${newInterval}ms due to network issues`);
 this.intervalId = setInterval(() => {
 if (this.isRunning) {
 this.fetchAndUpdate();
 }
 }, newInterval);
 }
 }
 }
 }

 stop() {
 console.log('Stopping price service');

 if (this.intervalId) {
 clearInterval(this.intervalId);
 this.intervalId = null;
 }

 this.isRunning = false;
 this.isStarting = false;
 this.currentSymbol = null;
 this.currentTimeframe = null;
 this.callback = null;
 this.offlineRetryCount = 0;

 // Удаляем обработчики событий
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
 }

 updateSymbol(symbol, timeframe) {
 if (this.isRunning) {
 this.start(symbol, timeframe, this.callback);
 }
 }
}