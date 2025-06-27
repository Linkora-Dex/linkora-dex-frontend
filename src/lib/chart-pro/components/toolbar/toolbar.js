export function handlePeriodChange(period) {
  console.log('Period changed:', period);
  chartStore.updatePeriod(period);
}

// Функция searchSymbols теперь перенесена в chartStore.js
// и не нужна здесь, так как используется из SymbolSelector
