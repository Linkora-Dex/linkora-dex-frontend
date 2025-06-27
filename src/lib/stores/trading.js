import { writable } from 'svelte/store';

function createTradingStore() {
  const { subscribe, set, update } = writable({
    activePair: 'ETH-PERP',
    orderType: 'market',
    positionType: 'long',
    leverage: 1,
    positions: [],
    orders: [],
    recentTrades: []
  });

  return {
    subscribe,
    setActivePair: (pair) => update(state => ({
      ...state,
      activePair: pair
    })),
    setOrderType: (type) => update(state => ({
      ...state,
      orderType: type
    })),
    setPositionType: (type) => update(state => ({
      ...state,
      positionType: type
    })),
    setLeverage: (leverage) => update(state => ({
      ...state,
      leverage: Number(leverage)
    })),
    addPosition: (position) => update(state => ({
      ...state,
      positions: [...state.positions, position]
    })),
    removePosition: (positionId) => update(state => ({
      ...state,
      positions: state.positions.filter(p => p.id !== positionId)
    })),
    addOrder: (order) => update(state => ({
      ...state,
      orders: [...state.orders, order]
    })),
    removeOrder: (orderId) => update(state => ({
      ...state,
      orders: state.orders.filter(o => o.id !== orderId)
    }))
  };
}

export const tradingStore = createTradingStore();