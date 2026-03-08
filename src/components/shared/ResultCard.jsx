import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters';

export const ResultCard = ({ label, value, type = 'currency', large = false }) => {
  const formatValue = () => {
    if (type === 'currency') return formatCurrency(value);
    if (type === 'percent') return formatPercent(value);
    if (type === 'number') return formatNumber(value);
    return value;
  };

  return (
    <div className="result-card">
      <div className="result-label">{label}</div>
      <div className={`result-value ${large ? 'large' : ''}`}>
        {formatValue()}
      </div>
    </div>
  );
};
