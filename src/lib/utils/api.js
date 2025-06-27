import axios from 'axios';

const API_CONFIG = {
    MARKET_DATA_BASE: 'http://localhost:8022',
    ORDER_SYSTEM_BASE: 'http://localhost:8080',
    REQUEST_TIMEOUT: 10000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000
};

class APIError extends Error {
    constructor(message, status, endpoint) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.endpoint = endpoint;
    }
}

class DEXAPIClient {
    constructor() {
        this.marketDataClient = this._createClient(API_CONFIG.MARKET_DATA_BASE);
        this.orderSystemClient = this._createClient(API_CONFIG.ORDER_SYSTEM_BASE);
        this.websocket = null;
        this.wsCallbacks = new Map();
    }

    _createClient(baseURL) {
        const client = axios.create({
            baseURL,
            timeout: API_CONFIG.REQUEST_TIMEOUT,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        client.interceptors.response.use(
            response => response,
            error => {
                const message = error.response?.data?.error || error.message || 'Unknown error';
                const status = error.response?.status || 500;
                const endpoint = error.config?.url || 'unknown';
                throw new APIError(message, status, endpoint);
            }
        );

        return client;
    }

    async _retryRequest(requestFn, retries = API_CONFIG.MAX_RETRIES) {
        try {
            return await requestFn();
        } catch (error) {
            if (retries > 0 && error.status >= 500) {
                await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                return this._retryRequest(requestFn, retries - 1);
            }
            throw error;
        }
    }

    // ============ MARKET DATA API ============

    async getSymbols() {
        return this._retryRequest(async () => {
            const response = await this.marketDataClient.get('/symbols');
            return response.data.symbols || [];
        });
    }

    async getMarkets() {
        const symbols = await this.getSymbols();
        const marketData = await Promise.all(
            symbols.map(async symbol => {
                try {
                    const ticker = await this.getMarketTicker(symbol);
                    return {
                        symbol,
                        price: ticker.current_price,
                        change24h: ticker.change_percent,
                        volume24h: ticker.volume,
                        category: symbol.includes('PERP') ? 'perpetual' : 'spot'
                    };
                } catch (error) {
                    console.error(`Failed to fetch data for ${symbol}:`, error);
                    return null;
                }
            })
        );
        return marketData.filter(Boolean);
    }

    async getMarketTicker(symbol) {
        return this._retryRequest(async () => {
            const response = await this.marketDataClient.get('/price', {
                params: {symbol, timeframe: '1H'}
            });
            return response.data;
        });
    }

    async getOrderBook(symbol, levels = 20) {
        return this._retryRequest(async () => {
            const response = await this.marketDataClient.get('/orderbook', {
                params: {symbol, levels}
            });
            return response.data;
        });
    }

    async getRecentTrades(symbol, limit = 50) {
        return this._retryRequest(async () => {
            try {
                const response = await this.marketDataClient.get(`/trades/${symbol}`, {
                    params: {limit}
                });
                return response.data.trades || [];
            } catch (error) {
                if (error.status === 404) {
                    return [];
                }
                throw error;
            }
        });
    }

    async getCandleData(symbol, timeframe = '1', limit = 500, startDate = null) {
        return this._retryRequest(async () => {
            const params = {symbol, timeframe, limit};
            if (startDate) params.start_date = startDate;

            const response = await this.marketDataClient.get('/candles', {params});
            return response.data || [];
        });
    }

    async getHealthStatus() {
        try {
            const response = await this.marketDataClient.get('/health');
            return response.data;
        } catch (error) {
            return {status: 'unhealthy', error: error.message};
        }
    }

    // ============ ORDER SYSTEM API ============

    async getUserPositions(userAddress, limit = 100, offset = 0) {
        return this._retryRequest(async () => {
            try {
                const response = await this.orderSystemClient.get(`/users/${userAddress}/positions`, {
                    params: {limit, offset}
                });
                return response.data;
            } catch (error) {
                if (error.status === 404) {
                    return {positions: [], total: 0, has_more: false};
                }
                throw error;
            }
        });
    }

    async getUserOrders(userAddress, status = null, limit = 100, offset = 0) {
        return this._retryRequest(async () => {
            const params = {limit, offset};
            if (status) params.status = status;

            const response = await this.orderSystemClient.get(`/users/${userAddress}/orders`, {
                params
            });
            return response.data;
        });
    }

    async getOrderDetails(orderId) {
        return this._retryRequest(async () => {
            const response = await this.orderSystemClient.get(`/orders/${orderId}`);
            return response.data.order;
        });
    }

    async getOrderEvents(orderId) {
        return this._retryRequest(async () => {
            const response = await this.orderSystemClient.get(`/orders/${orderId}/events`);
            return response.data.events || [];
        });
    }

    async getOrdersByStatus(status, limit = 100, offset = 0) {
        return this._retryRequest(async () => {
            const response = await this.orderSystemClient.get(`/orders/${status}`, {
                params: {limit, offset}
            });
            return response.data;
        });
    }

    async getAllOrders(status = null, limit = 100, offset = 0) {
        return this._retryRequest(async () => {
            const params = {limit, offset};
            if (status) params.status = status;

            const response = await this.orderSystemClient.get('/orders/all', {params});
            return response.data;
        });
    }

    async getOrderStatistics() {
        return this._retryRequest(async () => {
            const response = await this.orderSystemClient.get('/statistics');
            return response.data.statistics;
        });
    }

    async getSystemHealth() {
        try {
            const response = await this.orderSystemClient.get('/health');
            return response.data;
        } catch (error) {
            return {overall_status: 'unhealthy', error: error.message};
        }
    }

    // ============ USER DATA (MOCKED FOR NOW) ============

    async getUserBalances(userAddress) {
        return this._retryRequest(async () => {
            return {
                balances: [
                    {token: 'ETH', total: '0.0000', available: '0.0000', locked: '0.0000', value: '$0.00'},
                    {token: 'USDC', total: '0.0000', available: '0.0000', locked: '0.0000', value: '$0.00'},
                    {token: 'CAPY', total: '0.0000', available: '0.0000', locked: '0.0000', value: '$0.00'},
                    {token: 'AXOL', total: '0.0000', available: '0.0000', locked: '0.0000', value: '$0.00'},
                    {token: 'QUOK', total: '0.0000', available: '0.0000', locked: '0.0000', value: '$0.00'}
                ],
                totalBalance: '0.00',
                totalValue: '$0.00'
            };
        });
    }

    async getTradingHistory(userAddress, limit = 100, offset = 0) {
        return this._retryRequest(async () => {
            return {
                trades: [],
                total: 0,
                has_more: false
            };
        });
    }

    // ============ SWAP API (MOCKED FOR NOW) ============

    async getSwapTokens() {
        return this._retryRequest(async () => {
            return {
                tokens: [
                    {symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', decimals: 18, isNative: true},
                    {symbol: 'USDC', name: 'USD Coin', address: '0xa0b86a33e6cc8e08e6e7e77ea2e2c9b6dc1ca3e0', decimals: 6},
                    {symbol: 'CAPY', name: 'Capy Token', address: '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0', decimals: 18},
                    {symbol: 'AXOL', name: 'Axol Token', address: '0x0B306BF915C4d645ff596e518fAf3F9669b97016', decimals: 18},
                    {symbol: 'QUOK', name: 'Quok Token', address: '0x68B1D87F95878fE05B998F19b66F4baba5De1aed', decimals: 18}
                ]
            };
        });
    }

    async getSwapQuote(fromToken, toToken, amount) {
        return this._retryRequest(async () => {
            const estimatedOutput = (parseFloat(amount) * 0.998).toFixed(6);
            return {
                fromToken,
                toToken,
                fromAmount: amount,
                toAmount: estimatedOutput,
                price: '1.0',
                priceImpact: '0.1',
                fee: (parseFloat(amount) * 0.003).toFixed(6),
                minimumReceived: (parseFloat(estimatedOutput) * 0.99).toFixed(6),
                route: [fromToken, toToken],
                validFor: 30
            };
        });
    }

    async getSwapHistory(userAddress, limit = 100, offset = 0) {
        return this._retryRequest(async () => {
            return {
                swaps: [],
                total: 0,
                has_more: false
            };
        });
    }

    // ============ EARN/DEFI API (MOCKED FOR NOW) ============

    async getLendingPools() {
        return this._retryRequest(async () => {
            return {
                pools: [
                    {token: 'USDC', apy: '8.5', totalSupplied: '1200000', utilization: '75', minDeposit: '10'},
                    {token: 'ETH', apy: '6.2', totalSupplied: '890000', utilization: '68', minDeposit: '0.01'},
                    {token: 'CAPY', apy: '12.3', totalSupplied: '340000', utilization: '82', minDeposit: '100'}
                ]
            };
        });
    }

    async getStakingPools() {
        return this._retryRequest(async () => {
            return {
                pools: [
                    {token: 'DEX', apy: '15.2', totalStaked: '2100000', lockPeriod: '30', minStake: '100'},
                    {token: 'CAPY', apy: '18.5', totalStaked: '650000', lockPeriod: '60', minStake: '50'},
                    {token: 'AXOL', apy: '22.3', totalStaked: '290000', lockPeriod: '90', minStake: '25'}
                ]
            };
        });
    }

    async getLiquidityPools() {
        return this._retryRequest(async () => {
            return {
                pools: [
                    {pair: 'ETH/USDC', apy: '25.4', tvl: '1800000', volume24h: '450000', token0: 'ETH', token1: 'USDC'},
                    {pair: 'CAPY/ETH', apy: '32.1', tvl: '920000', volume24h: '180000', token0: 'CAPY', token1: 'ETH'},
                    {pair: 'AXOL/USDC', apy: '28.7', tvl: '640000', volume24h: '95000', token0: 'AXOL', token1: 'USDC'}
                ]
            };
        });
    }

    async getUserEarnPositions(userAddress) {
        return this._retryRequest(async () => {
            return {
                lending: [],
                staking: [],
                liquidity: [],
                totalValue: '0.00'
            };
        });
    }

    // ============ REWARDS API (MOCKED FOR NOW) ============

    async getUserRewards(userAddress) {
        return this._retryRequest(async () => {
            return {
                totalRewards: '0.00',
                claimableRewards: '0.00',
                rewards: [
                    {type: 'trading', token: 'DEX', amount: '0.00', source: 'Trading fees cashback', claimable: false},
                    {type: 'staking', token: 'DEX', amount: '0.00', source: 'Staking rewards', claimable: false},
                    {type: 'liquidity', token: 'DEX', amount: '0.00', source: 'LP rewards', claimable: false},
                    {type: 'referral', token: 'DEX', amount: '0.00', source: 'Referral bonuses', claimable: false}
                ]
            };
        });
    }

    async getRewardsHistory(userAddress, limit = 100, offset = 0) {
        return this._retryRequest(async () => {
            return {
                rewards: [],
                total: 0,
                has_more: false
            };
        });
    }

    // ============ WEBSOCKET MANAGEMENT ============

    connectWebSocket(symbol = 'all', type = 'candles', timeframe = '1') {
        try {
            const wsUrl = `ws://localhost:8000/ws?symbol=${symbol}&timeframe=${timeframe}&type=${type}`;

            if (this.websocket) {
                this.websocket.close();
            }

            this.websocket = new WebSocket(wsUrl);

            this.websocket.onopen = () => {
                console.log(`WebSocket connected: ${symbol} (${type})`);
            };

            this.websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'heartbeat') {
                        this.websocket.send(JSON.stringify({type: 'pong'}));
                        return;
                    }

                    const callbackKey = `${symbol}_${type}`;
                    const callback = this.wsCallbacks.get(callbackKey);
                    if (callback) {
                        callback(data);
                    }
                } catch (error) {
                    console.error('WebSocket message parse error:', error);
                }
            };

            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            this.websocket.onclose = (event) => {
                console.log('WebSocket closed:', event.code, event.reason);
                if (event.code !== 1000) {
                    setTimeout(() => {
                        this.connectWebSocket(symbol, type, timeframe);
                    }, 5000);
                }
            };

            return this.websocket;
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
            throw error;
        }
    }

    subscribeToUpdates(symbol, type, callback) {
        const callbackKey = `${symbol}_${type}`;
        this.wsCallbacks.set(callbackKey, callback);
    }

    unsubscribeFromUpdates(symbol, type) {
        const callbackKey = `${symbol}_${type}`;
        this.wsCallbacks.delete(callbackKey);
    }

    disconnectWebSocket() {
        if (this.websocket) {
            this.websocket.close(1000, 'Normal closure');
            this.websocket = null;
        }
        this.wsCallbacks.clear();
    }

    // ============ UTILITY METHODS ============

    formatPrice(price) {
        const num = parseFloat(price);
        if (num >= 1000) {
            return num.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        }
        return num.toFixed(6);
    }

    formatPercentage(value, decimals = 2) {
        return parseFloat(value).toFixed(decimals) + '%';
    }

    formatCurrency(amount, currency = 'USD') {
        const num = parseFloat(amount);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    }

    formatTokenAmount(amount, decimals = 6) {
        return parseFloat(amount).toFixed(decimals);
    }

    validateAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    validateOrderId(orderId) {
        return /^\d+$/.test(String(orderId));
    }
}

export const apiClient = new DEXAPIClient();
export {APIError};