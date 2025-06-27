import { goto } from '$app/navigation';

export function navigateToTrade(pair = 'ETH-PERP') {
  goto(`/trade/${pair}`);
}

export function navigateToMarkets(filter = null) {
  const url = filter ? `/markets?filter=${filter}` : '/markets';
  goto(url);
}

export function navigateToPortfolio(tab = null) {
  const url = tab ? `/portfolio?tab=${tab}` : '/portfolio';
  goto(url);
}

export function navigateToSwap(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.from) searchParams.set('from', params.from);
  if (params.to) searchParams.set('to', params.to);
  if (params.amount) searchParams.set('amount', params.amount);

  const url = searchParams.toString() ? `/swap?${searchParams}` : '/swap';
  goto(url);
}

export function getActiveRoute(pathname) {
  if (pathname.startsWith('/trade')) return 'trade';
  if (pathname.startsWith('/markets')) return 'markets';
  if (pathname.startsWith('/portfolio')) return 'portfolio';
  if (pathname.startsWith('/earn')) return 'earn';
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/help')) return 'help';
  return 'home';
}

export function formatPair(pair) {
  return pair.replace('-', '/');
}

export function parsePair(formattedPair) {
  return formattedPair.replace('/', '-');
}