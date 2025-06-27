import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createWalletStore() {
  // Инициализируем состояние из localStorage
  const initialState = {
    isConnected: false,
    address: '',
    provider: null,
    signer: null
  };

  // Загружаем сохраненное состояние при инициализации
  if (browser) {
    try {
      const savedState = localStorage.getItem('wallet_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        initialState.isConnected = parsed.isConnected || false;
        initialState.address = parsed.address || '';
      }
    } catch (error) {
      console.error('Error loading wallet state:', error);
    }
  }

  const { subscribe, set, update } = writable(initialState);

  // Функция для сохранения состояния в localStorage
  function saveState(state) {
    if (browser) {
      try {
        localStorage.setItem('wallet_state', JSON.stringify({
          isConnected: state.isConnected,
          address: state.address
        }));
      } catch (error) {
        console.error('Error saving wallet state:', error);
      }
    }
  }

  // Функция для восстановления подключения при загрузке страницы
  async function restoreConnection() {
    if (browser && window.ethereum && initialState.isConnected && initialState.address) {
      try {
        // Проверяем, что MetaMask все еще подключен к нашему сайту
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });

        if (accounts.length > 0 && accounts[0].toLowerCase() === initialState.address.toLowerCase()) {
          // Восстанавливаем подключение
          const newState = {
            isConnected: true,
            address: accounts[0],
            provider: window.ethereum,
            signer: null
          };
          set(newState);
          saveState(newState);
        } else {
          // Сбрасываем состояние, если аккаунт изменился
          disconnect();
        }
      } catch (error) {
        console.error('Error restoring wallet connection:', error);
        disconnect();
      }
    }
  }

  // Восстанавливаем подключение при инициализации
  if (browser) {
    restoreConnection();

    // Слушаем изменения аккаунтов в MetaMask
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          update(state => {
            const newState = {
              ...state,
              address: accounts[0],
              isConnected: true
            };
            saveState(newState);
            return newState;
          });
        }
      });

      window.ethereum.on('chainChanged', () => {
        // Перезагружаем страницу при смене сети
        window.location.reload();
      });
    }
  }

  function disconnect() {
    const newState = {
      isConnected: false,
      address: '',
      provider: null,
      signer: null
    };
    set(newState);
    saveState(newState);
  }

  return {
    subscribe,
    connect: async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
          });

          if (accounts.length > 0) {
            const newState = {
              isConnected: true,
              address: accounts[0],
              provider: window.ethereum,
              signer: null
            };
            set(newState);
            saveState(newState);
          }
        } else {
          throw new Error('MetaMask not found. Please install MetaMask to continue.');
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        throw error;
      }
    },
    disconnect
  };
}

export const walletStore = createWalletStore();