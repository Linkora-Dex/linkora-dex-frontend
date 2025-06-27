const DEFAULT_CONFIG = {
 API_BASE_URL: 'http://localhost:8022',
 WS_BASE_URL: 'ws://localhost:8000',
 DEFAULT_EXCHANGE: 'Linkora DEX',
 CONNECTION_TIMEOUT: 30000,
 MAX_RETRIES: 5,
 RETRY_DELAY_BASE: 1000,
 MAX_RETRY_DELAY: 30000,
 DEFAULT_LIMIT: 1000,
 MAX_LIMIT: 5000
};

function getEnvVar(key, defaultValue) {
 if (typeof window !== 'undefined') {
 return window.__APP_CONFIG__?.[key] || defaultValue;
 }

 if (typeof process !== 'undefined' && process.env) {
 return process.env[`VITE_${key}`] || defaultValue;
 }

 return defaultValue;
}

export const CONFIG = {
 API_BASE_URL: getEnvVar('API_BASE_URL', DEFAULT_CONFIG.API_BASE_URL),
 WS_BASE_URL: getEnvVar('WS_BASE_URL', DEFAULT_CONFIG.WS_BASE_URL),
 DEFAULT_EXCHANGE: getEnvVar('DEFAULT_EXCHANGE', DEFAULT_CONFIG.DEFAULT_EXCHANGE),
 CONNECTION_TIMEOUT: parseInt(getEnvVar('CONNECTION_TIMEOUT', DEFAULT_CONFIG.CONNECTION_TIMEOUT)),
 MAX_RETRIES: parseInt(getEnvVar('MAX_RETRIES', DEFAULT_CONFIG.MAX_RETRIES)),
 RETRY_DELAY_BASE: parseInt(getEnvVar('RETRY_DELAY_BASE', DEFAULT_CONFIG.RETRY_DELAY_BASE)),
 MAX_RETRY_DELAY: parseInt(getEnvVar('MAX_RETRY_DELAY', DEFAULT_CONFIG.MAX_RETRY_DELAY)),
 DEFAULT_LIMIT: parseInt(getEnvVar('DEFAULT_LIMIT', DEFAULT_CONFIG.DEFAULT_LIMIT)),
 MAX_LIMIT: parseInt(getEnvVar('MAX_LIMIT', DEFAULT_CONFIG.MAX_LIMIT))
};

export function updateConfig(newConfig) {
 Object.assign(CONFIG, newConfig);
 console.log('Configuration updated:', CONFIG);
}

export function getApiUrl(endpoint = '') {
 return `${CONFIG.API_BASE_URL}${endpoint}`;
}

export function getWsUrl(params = '') {
 const wsBase = CONFIG.WS_BASE_URL;

 if (wsBase === 'auto' || !wsBase) {
 const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
 const host = window.location.host;
 return `${protocol}//${host}/ws${params}`;
 }

 if (wsBase.startsWith('ws://') || wsBase.startsWith('wss://')) {
 return `${wsBase}${params}`;
 }

 const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
 return `${protocol}//${wsBase}${params}`;
}

export function validateConfig() {
 const required = ['API_BASE_URL', 'WS_BASE_URL'];
 const missing = required.filter(key => !CONFIG[key]);

 if (missing.length > 0) {
 console.error('Missing required configuration:', missing);
 return false;
 }

 console.log('Configuration validated:', CONFIG);
 return true;
}