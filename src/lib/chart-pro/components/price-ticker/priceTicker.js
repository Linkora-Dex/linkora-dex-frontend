export function formatPrice(price, decimals = 8) {
 if (!price || isNaN(price) || price === 0) return '0.00000000';
 const numPrice = parseFloat(price);
 if (numPrice === 0) return '0.00000000';
 return numPrice.toFixed(decimals);
}

export function calculatePriceChange(currentPrice, previousPrice) {
 if (!currentPrice || !previousPrice || isNaN(currentPrice) || isNaN(previousPrice)) {
 return { absolute: 0, percentage: 0, direction: 'neutral' };
 }

 const current = parseFloat(currentPrice);
 const previous = parseFloat(previousPrice);

 if (current === 0 || previous === 0) {
 return { absolute: 0, percentage: 0, direction: 'neutral' };
 }

 const absolute = current - previous;
 const percentage = ((absolute / previous) * 100);

 let direction = 'neutral';
 if (absolute > 0) direction = 'up';
 else if (absolute < 0) direction = 'down';

 return {
 absolute: absolute,
 percentage: percentage,
 direction: direction
 };
}

export function formatChange(change, decimals = 8) {
 if (!change || isNaN(change)) return '+0.00000000';
 const sign = change >= 0 ? '+' : '';
 return `${sign}${parseFloat(change).toFixed(decimals)}`;
}

export function formatPercentage(percentage, decimals = 2) {
 if (!percentage || isNaN(percentage)) return '+0.00%';
 const sign = percentage >= 0 ? '+' : '';
 return `${sign}${parseFloat(percentage).toFixed(decimals)}%`;
}

export function getDirectionIcon(direction) {
 switch (direction) {
 case 'up': return '▲';
 case 'down': return '▼';
 default: return '●';
 }
}