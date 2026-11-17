export const formatFinancial = (value: number, unit: 'B' | 'M' = 'B'): string => {
  if (value === undefined || value === null) return '$0';
  
  if (unit === 'B') {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}T`;
    }
    if (value >= 1) {
      return `$${value.toFixed(1)}B`;
    }
    return `$${(value * 1000).toFixed(0)}M`;
  }
  
  if (unit === 'M') {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}B`;
    }
    return `$${value.toFixed(0)}M`;
  }
  
  return `$${value}`;
};
