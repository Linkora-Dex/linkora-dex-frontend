// НЕМЕДЛЕННО отключаем все логи кроме критических ошибок
console.log = () => {};
console.info = () => {};
console.debug = () => {};
console.warn = () => {};

// Сохраняем только console.error для критических ошибок
const originalError = console.error.bind(console);
console.error = originalError;

// Глобальные команды
window.enableLogs = () => {
 console.log('Перезагрузите страницу для включения логов');
};

window.disableLogs = () => {
 console.log = () => {};
 console.info = () => {};
 console.debug = () => {};
 console.warn = () => {};
 originalError('Логи отключены');
};