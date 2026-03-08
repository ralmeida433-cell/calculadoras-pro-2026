export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatPercent = (value) => {
  return `${value.toFixed(2)}%`;
};

export const formatNumber = (value) => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

export const parseNumber = (value) => {
  if (typeof value === 'string') {
    return parseFloat(value.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
  }
  return value || 0;
};
