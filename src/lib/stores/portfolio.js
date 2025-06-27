import { writable } from 'svelte/stores';

function createPortfolioStore() {
  const { subscribe, set, update } = writable({
    totalBalance: 0,
    availableBalance: 0,
    lockedBalance: 0,
    pnl24h: 0,
    balances: [],
    history: []
  });

  return {
    subscribe,
    updateBalance: (token, balance) => update(state => ({
      ...state,
      balances: state.balances.map(b =>
        b.token === token ? { ...b, ...balance } : b
      )
    })),
    addHistoryItem: (item) => update(state => ({
      ...state,
      history: [item, ...state.history]
    })),
    setTotalBalance: (total) => update(state => ({
      ...state,
      totalBalance: total
    })),
    setPnl24h: (pnl) => update(state => ({
      ...state,
      pnl24h: pnl
    })),
    initializeBalances: (tokens) => update(state => ({
      ...state,
      balances: tokens.map(token => ({
        token: token.symbol,
        name: token.name,
        total: '0.0000',
        available: '0.0000',
        locked: '0.0000',
        value: '$0.00'
      }))
    }))
  };
}

export const portfolioStore = createPortfolioStore();